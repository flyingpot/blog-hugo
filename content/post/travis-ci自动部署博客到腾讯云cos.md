+++
date = "2019-04-05T11:00:00+08:00"
title = "travis-ci自动部署博客到腾讯云COS"
url = "travis-ci_to_cos"

+++
我的博客使用的是hugo，博客一直放在腾讯云COS上，只要域名备案就能使用，加上CDN速度也不错。但是使用腾讯云COS更新博客，需要登录腾讯云控制台，手动把本地hugo生成的文件上传到COS上，十分痛苦并且一点也不geek。与之形成鲜明对比的就是netlify，部署十分方便，只要把hugo文件夹设置成github repo，仓库一更新，网站就会自动部署。再搭配上[forestry.io](https://forestry.io/)的hugo cms，博客更新就可以完全放在云上。因此我就想该如何解放双手，将上传过程简化。持续集成服务（Continuous Integration, CI）就是一个好的选择。

# Travis CI

因为之前看到别人github的repo里面有.travis.yml文件，对于Travis CI有一定了解，因此我决定使用这个持续集成服务。在简单看了文档之后，我发现配置十分智能，直接使用github账号登录，然后就可以绑定对应的repo。之后就可以在对应repo里面加入.travis.yml文件，在这个文件里面就可以加入脚本等内容，Travis CI就会根据这个配置文件进行对应的构建和部署。

举个例子：

```yaml
language: python
python:
  - "2.6"
  - "2.7"
  - "3.3"
  - "3.4"
  - "3.5"
  - "3.5-dev"  # 3.5 development branch
  - "3.6"
  - "3.6-dev"  # 3.6 development branch
# command to install dependencies
install:
  - pip install -r requirements.txt
# command to run tests
script:
  - pytest
```

可以看到，配置文件中可以设置语言和版本，安装依赖并且运行脚本，相当的自由