+++
date = "2019-04-05T11:00:00+08:00"
title = "travis-ci自动部署博客到腾讯云COS"
url = "travis-ci_to_cos"

+++
我的博客使用的是hugo，博客一直放在腾讯云COS上，域名备案就能使用，加上CDN速度也不错。但是使用腾讯云COS更新博客，需要登录腾讯云控制台，手动把本地hugo生成的文件上传到COS上，十分痛苦并且一点也不geek。与之形成鲜明对比的就是netlify，相比之下就十分方便，只要把hugo文件夹设置成github仓库，仓库一更新，网站就会自动部署。再搭配上[forestry.io](https://forestry.io/)的hugo cms，博客更新就可以完全放在云上。