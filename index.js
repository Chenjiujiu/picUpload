import * as qiniu from './qiniu.min.js'
window.onload = function () {
new Page()


	class Page {
		constructor() {
			this.dom={
				fileDom: document.querySelector("#files"),
				upFiles:document.querySelector(".upfiles"),
				yunDom : document.getElementsByClassName("yun"),
				load:document.querySelector("#status-load"),
				ok:document.querySelector("#status-ok"),
			}
			this.token='';
			this.domain='';
			this.files=this.dom.fileDom.files;
			this.init();

		}
		init(){
			this.getToken();
			this.dom.fileDom.onchange=(e)=>{
				this.addFiles()
			}
		}
		getToken(){
			this.status(false);
			let serve=null;
			for (let i = 0; i < this.dom.yunDom.length; i++) {
				if(yundom[i].checked){
					serve=yundom[i].value;
				}
			}
			let xhr=null;
			if(window.XMLHttpRequest){
				xhr=new window.XMLHttpRequest();
			}else {
				xhr=new ActiveXObject("Microsoft.XMLHTTP");
			}
			// let url='https://chenjiujiu.com/picUpload/serve/'+serve+'-token.php'
			let url='./serve/'+serve+'-token.php'
			xhr.open('get',url,true);
			xhr.send(null);
			xhr.onreadystatechange=()=> {
				if( xhr.readyState ===4 && xhr.status === 200 ){
					let res= JSON.parse(xhr.responseText);
					if (res.code){
						this.status(true)
						this.token=res.token;
						this.domain=res.domain;
					}else {
						this.status(false);
					}
				}
			}
		}
		status(state){
			if(state){
				this.dom.load.style.display='none';
				this.dom.ok.style.display='inline-block';
			}else {
				this.dom.load.style.display='inline-block';
				this.dom.ok.style.display='none';
			}
		}
		addFiles(){
			for (let i = 0; i < this.files.length; i++) {
				new File(this.files[i])
			}
		}
	}




	class File {
		constructor(file) {
			this.file=file
			this.dom={
				fileDom: document.querySelector("#files"),
				upFiles:document.querySelector(".upfiles"),
				yunDom : document.getElementsByClassName("yun"),
				load:document.querySelector("#status-load"),
				ok:document.querySelector("#status-ok"),
			}
			this.newdom=null;
			this.observable=null;
			this.init()
		}
		init(){
			this.createdom();
			this.add2body();
			this.observable = qiniu.upload(this.file, this.domain, this.token, putExtra, config)
		}

		createdom(){
			this.newdom=document.createElement('tr')
			this.newdom.setAttribute('data-id',this.file.name)
			let newHtml = `
				<td>
					${this.file.name}
				</td>
				<td>
					${(this.file.size/1024/1024).toFixed(2)}M
				</td>
				<td>
					<div class="upfile-info">
						<div class="progress-box">
							<div class="progress">
								<div class="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar" style="width: 0%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">0%</div>
							</div>
						</div>
						<button class="upfile-close upfile-close btn btn-sm btn-danger">X</button>
					</div>
					<div class="upfile-err"><span class="d-inline-block bg-danger"></span><span class="err-msg">取消上传</span></div>
					<div class="upfile-ok"><span class="d-inline-block bg-success"></span><a href="#" class="upfile-ok-link">www.fwafwaf.fawef/fawf</a></div>
				</td>
				`;
			this.newdom.innerHTML=newHtml;
		}
		add2body(){
			this.dom.upFiles.appendChild(this.newdom);
		}
		start(){
			this.subscription=observable.subscribe(observer)
		}
		stop(){
			this.subscription.unsubscribe()
		}
		concel(dom) {
			this.stop();
			let td =dom.parentNode.parentNode;
			dom.parentNode.style.display='none';
			td.querySelector('.upfile-err').style.display='block';
			td.querySelector('.upfile-ok').style.display='none';
			td.querySelector('.err-msg').innerHTML='取消上传';
		}
	}

		function status(b){

	}

