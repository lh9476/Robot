var http = require("http");
var fs = require("fs");
var url = require("url");
var req = require("request")

http.createServer(function (request, response) {
    //静态资源服务器
    var pathName = url.parse(request.url).pathname;

    if(isStaticRequest(pathName)){
        try{
            var data = fs.readFileSync("./page" + pathName);
            response.writeHead(200);
            response.write(data);
            response.end();
        }catch (e) {
            response.writeHead(404);
            response.write("<html><body><h1>404 NotFound</h1></body></html>");
            response.end();
        }
    }else {
        var params = url.parse(request.url, true).query;
        //向图灵API发出请求，拿到请求结果，返回给页面
        var data = {
            "reqType":0,
            "perception": {
                "inputText": {
                    "text": params.text
                },
            },
            "userInfo": {
                "apiKey": "58e526ccc5b34357bdd962a61fd98060",
                "userId": "515937"
            }
        };
        req({
            url:"http://openapi.tuling123.com/openapi/api/v2",
            method:"POST",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify(data),
        }, function(error, resp, body) {
            if(!error && resp.statusCode == 200){
                //拿到请求结果
                var obj = JSON.parse(body);
                if(obj && obj.results && obj.results.length > 0 && obj.results[0].values){
                    //返回给页面
                    var head = {
                        "Access-Control-Allow-Origin":"*",
                        "Access-Control-Allow-Method":"GET",
                        "Access-Control-Allow-Headers":"x-requested-with, content-type"
                    }
                    response.writeHead(200);
                    response.write(JSON.stringify(obj.results[0].values))
                    response.end();
                }
            }
        })
    }

}).listen(12306);

function isStaticRequest(pathName) {
    var staticFuleList = [".html", ".css", ".js", ".jpg", ".png", ".jpeg"];
    for(var i = 0; i < staticFuleList.length; i++){
        if (pathName.indexOf(staticFuleList[i]) == pathName.length - staticFuleList[i].length){
            return true;
        }
    }
    return false;
}