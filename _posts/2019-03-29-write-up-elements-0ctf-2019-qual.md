---
lang: "en"
layout: no-header
title: "Writeup Elements - re - 0ctf 2019 quals"
categories: CTF
tags: [re, 0ctf, double, systemofequations]
excerpt: "A flag checker. We have to solve system of equations to find the flag"
post-thumb: post-thumb-2.png
comments: true
color-theme: "#11385f"
js-files: ["no-header", "wu-elements"]
---
# Writeup Elements - re - 0ctf 2019 quals
Hello friend.

We were given a ELF file [Elements](/archives/0ctf-2019/Elements) By running it I found that it is some kind of flag checker. I used IDA to decompile it

And I recognize the following:
- Flag's length is 44 and its format is flag{XXXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXX}  
  ```c
    if ( length >= 44 && (*(_QWORD *)flag & 0xFFFFFFFFFFLL) == "{galf" && v27 == '}' )
  ```
- There are three parts inside the brackets, each part is a hexadecimal number
  ```c
    while ( strlen(part) == 12 )
    {
    v10 = *part;
    v11 = 0LL;
    if ( *part )
    {
        v12 = *__ctype_b_loc();
        v13 = 1LL;
        v11 = 0LL;
        do
        {
        v14 = v10;
        v15 = v12[v10];
        if ( (char)v14 <= 102 && v15 & 0x400 )
        {
            v16 = v14 - 0x57;
        }
        else
        {
            if ( !(v15 & 0x800) )
            goto LABEL_31;
            v16 = v14 - 48;
        }
        v11 = v16 | 16 * v11;
        if ( v13 > 11 )
            break;
        v10 = part[v13++];
        }
        while ( v10 );
    }
  ```
- The first part is 391BC2164F0A
  ```c
    if ( !v9 && v11 != 0x391BC2164F0ALL )
  ```
- The second and third part is the solution of this system of equations 
  ```c
    /*
        part 1 is x, part 2 is y, part 3 is z
    */
    if ( y <= x || z <= y || x + y <= z )
        break;
    v19 = y * y + x * x - z * z;
    v20 = sqrt(4.0 * x * x * y * y - v19 * v19) * 0.25;
    v21 = (v20 + v20) / (x + y + z) + -1.940035480806554e13;
    if ( v21 < 0.00001 && v21 > -0.00001 )
    {
        v22 = x * y * z / (v20 * 4.0) + -4.777053952827391e13;
        if ( v22 < 0.00001 && v22 > -0.00001 )
            puts("Congratz, input is your flag");
    }
  ```
- Note that we must use the absolute value of constances in the equations to solve it. If you use the value that IDA decompiled we wont be able to solve it :v So to find the values I used gdb

  ![ida-value](/assets/images/75.PNG)
  
  ![gdb](/assets/images/74.png)

  So the equations can be represents in Python like this

  ![python](/assets/images/76.PNG)

My friend solve the equations and its solution is  
{% highlight plaintext linenos %}
    y = 4064e4798769
    z = 56e0de138176
{% endhighlight %}

Finally the flag is: flag{391BC2164F0A-4064e4798769-56e0de138176}
