<?php
require './autoload.php';
use Qiniu\Auth;
$accessKey = 'U6wgPeaYrdVUCnyz69L7xQyIFunhtz-vpm_212_J';
$secretKey = 'TSTjnvmt3ahNypDFrK7-EIeisjfOM5IKLjo_cCt-';
$auth = new Auth($accessKey, $secretKey);

$bucket = 'space-cjj';
// 生成上传Token
$token = $auth->uploadToken($bucket);
header('Access-Control-Allow-Origin:*');
header('Content-Type:application/json');
$json['uptoken'] = $token;
$json['code'] = 1;
$json['domain'] = 'pic2.chenjiujiu.com';
echo json_encode($json,JSON_UNESCAPED_UNICODE);
?>