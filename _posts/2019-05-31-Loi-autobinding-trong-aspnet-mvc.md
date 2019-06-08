---
layout: post-with-toc
title: "Lỗi Autobinding trong ASP.NET MVC"
h1: "Lỗi Autobinding trong ASP.NET MVC"
categories: Vulnerabilites
tags: [autobinding, aspnet, mvc]
excerpt: "Một lỗi gần đây tôi có tìm hiểu"
post-thumb: 206.PNG
comments: true
color-theme: "#052f6f"
js-files: ["post-with-toc"]
---

## Mở đầu
Hi. Đã lâu không viết lách gì. Cũng tại dạo này tôi nhiều công chuyện quá. Thôi thì hôm nay xin được tái xuất với bài viết về một lỗi gần đây tôi có tìm hiểu.  
Tôi nghe danh lỗi này từ giải volgactf2019. Giải đó có 2 bài web [shop](https://ctftime.org/task/7959) và [shop2](https://ctftime.org/task/7975) về lỗi này, code bằng java. Bẵng đi một thời gian, gần đây, tôi có làm một đề CTF dùng ASP.NET MVC về IDOR, cơ mà lại dính cả lỗi này nữa. May là không bị unintended. :relieved:  
## Lỗi gì đây ?
Autobinding (hay còn gọi là Mass Assignment) là lỗi xảy ra khi developer bind trực tiếp param trong request với một biến hoặc một object của chương trình, thường là bind vào một Model. Lỗi này khá phổ biến trong các frameworks như: Spring MVC, ASP NET MVC, Ruby on Rails. Khai thác lỗi này, attacker sẽ control được thuộc tính của Model theo ý muốn. Nếu Model được lưu trong DB thì còn có thể control trường giá trị tương ứng với thuộc tính đó, dẫn đến nhiều lỗi khác nữa.
## Ví dụ
Để ví dụ, tôi sẽ tạo một ứng dụng giả định cho phép người dùng reg account. Model của account được khai báo như sau.
```csharp
public class User
{
    public int ID { get; set; }
    public string Username { get; set; }
    public int IsAdmin { get; set; }
}
```
Class bao gồm các thuộc tính:
- ID: là key của account trong DB.
- Username: username do người dùng đặt.
- IsAdmin: quyết định account có quyền admin không. 

Tất nhiên khi người dùng tạo account tôi sẽ chỉ cho phép họ đặt Username và không cho phép đặt giá trị của IsAdmin.  
Phần Controller xử lí quá trình register.
```csharp
//POST: /Home/Register
[HttpPost]
[ValidateAntiForgeryToken]
public ActionResult Register(User user)
{
    if (ModelState.IsValid)
    {
        using(UserDBContext db = new UserDBContext())
        {
            db.Users.Add(user);
            db.SaveChanges();
        }
    }
    return View();
}
```
Bạn có thể thấy tôi đã dùng trực tiếp class User làm param cho action Register.  
Phần View của Register tôi sẽ chỉ hiện form để người dùng đặt Username như đã định.  
```html
@model tt1.Models.User
@{
    ViewBag.Title = "Register";
}
<h2>Register</h2>
@using (Html.BeginForm()) 
{
    @Html.AntiForgeryToken()
    
    <div class="form-horizontal">
        <hr />
        @Html.ValidationSummary(true, "", new { @class = "text-danger" })
        <div class="form-group">
            @Html.LabelFor(model => model.Username, htmlAttributes: new { @class = "control-label col-md-2" })
            <div class="col-md-10">
                @Html.EditorFor(model => model.Username, new { htmlAttributes = new { @class = "form-control" } })
                @Html.ValidationMessageFor(model => model.Username, "", new { @class = "text-danger" })
            </div>
        </div>

        <div class="form-group">
            <div class="col-md-offset-2 col-md-10">
                <input type="submit" value="Create" class="btn btn-primary" />
            </div>
        </div>
    </div>
}
```
Trông nó như lày:    

![200](/assets/images/200.PNG)
Giờ tôi dùng form đăng kí một user mới, request của nó sẽ như thế này:  

![201](/assets/images/201.PNG)
Kết quả user đã được tạo trong DB với trường Username là giá trị param trong request và IsAdmin nhận giá trị mặc định là 0.  

![202](/assets/images/202.PNG)  
Thế nếu giờ thêm param IsAdmin vào thì sẽ như thế nào :thinking:  

![203](/assets/images/203.PNG)
Boom, param đã map với thuộc tính của Model nên tôi đã tạo được user có trường IsAdmin do tôi control.  

![204](/assets/images/204.PNG)  
Sau khi test thêm thì tôi nhận ra là tên của param và tên thuộc tính match với nhau case insensitive. Có nghĩa là có thể dùng param là isadmin, iSaDmIn hay ISADMIN đều được.  

![205](/assets/images/205.PNG)  
![206](/assets/images/206.PNG)
## Khai thác ?
Vậy để khai thác lỗi này là ta cần biết được tên thuộc tính mà ta muốn control, có thể thông qua source code hoặc là bruteforce. Hồi xưa Github đã từng dính bug này [link](https://github.blog/2012-03-04-public-key-security-vulnerability-and-mitigation/).
## Patches
Để tránh lỗi này thì ta có thể dùng cách là tạo class Model tương ứng với từng View, tách biệt với model User ta lưu vào DB. Class này sẽ chỉ có các thuộc tính để đáp ứng đủ cho chức năng của View đó thôi. Chẳng hạn ta tạo Model cho Register.  
```cs
public class RegisterViewModel
{
    [Key]
    public string Username { get; set; }
}
```
Action Register sẽ nhận param có kiểu là Model vừa tạo. Sau khi check ModelState.IsValid ta chuyển các thuộc tính của nó sang cho Model User rồi mới add vào DB. 
```cs
//POST: /Home/Register
[HttpPost]
[ValidateAntiForgeryToken]
public ActionResult Register(RegisterViewModel model)
{
    if (ModelState.IsValid)
    {
        User user = new User { Username = model.Username };
        using(UserDBContext db = new UserDBContext())
        {
            db.Users.Add(user);
            db.SaveChanges();
        }
    }
    return View();
}
```
Bài viết đến đây là kết thúc, hẹn gặp lại các bạn vào một ngày đẹp trời. :sunglasses:
## References
1. [https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Mass_Assignment_Cheat_Sheet.md](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Mass_Assignment_Cheat_Sheet.md)
2. [https://odetocode.com/Blogs/scott/archive/2012/03/11/complete-guide-to-mass-assignment-in-asp-net-mvc.aspx](https://odetocode.com/Blogs/scott/archive/2012/03/11/complete-guide-to-mass-assignment-in-asp-net-mvc.aspx)
3. [http://judeokelly.com/mvc-security-default-model-binding/](http://judeokelly.com/mvc-security-default-model-binding/)
4. [https://andrewlock.net/preventing-mass-assignment-or-over-posting-in-asp-net-core/](https://andrewlock.net/preventing-mass-assignment-or-over-posting-in-asp-net-core/)