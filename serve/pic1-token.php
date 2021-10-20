<?php
require './autoload.php';
use Qiniu\Auth;
$accessKey = '_jbDRXzCQcAO0aG7DDPGlnkyM5IcdSN68jQSX2rA';
$secretKey = '_3t2ofJ4qDhg3nyaKaQGUUsGFpVuDgPuDypYeQ84';
$auth = new Auth($accessKey, $secretKey);

$bucket = 'products-cjj';
// 生成上传Token
$token = $auth->uploadToken($bucket);
header('Access-Control-Allow-Origin:*');
header('Content-Type:application/json');
$json['uptoken'] = $token;
$json['code'] = 1;
$json['domain'] = 'pic.chenjiujiu.com';
echo json_encode($json,JSON_UNESCAPED_UNICODE);
?>