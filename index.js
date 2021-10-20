

window.onload = function () {
	var JSonToCSV = {
		/*
     * obj是一个对象，其中包含有：
     * ## data 是导出的具体数据
     * ## fileName 是导出时保存的文件名称 是string格式
     * ## showLabel 表示是否显示表头 默认显示 是布尔格式
     * ## columns 是表头对象，且title和key必须一一对应，包含有
          title:[], // 表头展示的文字
          key:[], // 获取数据的Key
          formatter: function() // 自定义设置当前数据的 传入(key, value)
     */
		setDataConver: function (obj,dom) {
			var bw = this.browser();
			if (bw['ie'] < 9) return; // IE9以下的
			var data = obj['data'],
				ShowLabel = typeof obj['showLabel'] === 'undefined' ? true : obj['showLabel'],
				fileName = (obj['fileName'] || 'UserExport') + '.csv',
				columns = obj['columns'] || {
					title: [],
					key: [],
					formatter: undefined
				};
			var ShowLabel = typeof ShowLabel === 'undefined' ? true : ShowLabel;
			var row = "", CSV = '', key;
			// 如果要现实表头文字
			if (ShowLabel) {
				// 如果有传入自定义的表头文字
				if (columns.title.length) {
					columns.title.map(function (n) {
						row += n + ',';
					});
				} else {
					// 如果没有，就直接取数据第一条的对象的属性
					for (key in data[0]) row += key + ',';
				}
				row = row.slice(0, -1); // 删除最后一个,号，即a,b, => a,b
				CSV += row + '\r\n'; // 添加换行符号
			}
			// 具体的数据处理
			data.map(function (n) {
				row = '';
				// 如果存在自定义key值
				if (columns.key.length) {
					columns.key.map(function (m) {
						row += '"' + (typeof columns.formatter === 'function' ? columns.formatter(m, n[m]) || n[m] : n[m]) + '",';
					});
				} else {
					for (key in n) {
						row += '"' + (typeof columns.formatter === 'function' ? columns.formatter(key, n[key]) || n[key] : n[key]) + '",';
					}
				}
				row.slice(0, row.length - 1); // 删除最后一个,
				CSV += row + '\r\n'; // 添加换行符号
			});
			if (!CSV) return;
			this.SaveAs(fileName, CSV, dom);
		},
		SaveAs: function (fileName, csvData, dom) {
			var bw = this.browser();
			if (!bw['edge'] || !bw['ie']) {
				// var alink = document.createElement("a");
				// alink.id = "linkDwnldLink";
				// alink.href = this.getDownloadUrl(csvData);
				// document.body.appendChild(alink);
				// var linkDom = document.getElementById('linkDwnldLink');
				// linkDom.setAttribute('download', fileName);
				// linkDom.click();
				// document.body.removeChild(linkDom);
				dom.href = this.getDownloadUrl(csvData);
				dom.setAttribute('download', fileName);
			}
			else if (bw['ie'] >= 10 || bw['edge'] == 'edge') {
				var _utf = "\uFEFF";
				var _csvData = new Blob([_utf + csvData], {
					type: 'text/csv'
				});
				navigator.msSaveBlob(_csvData, fileName);
			}
			else {
				var oWin = window.top.open("about:blank", "_blank");
				oWin.document.write('sep=,\r\n' + csvData);
				oWin.document.close();
				oWin.document.execCommand('SaveAs', true, fileName);
				oWin.close();
			}
		},
		getDownloadUrl: function (csvData) {
			var _utf = "\uFEFF"; // 为了使Excel以utf-8的编码模式，同时也是解决中文乱码的问题
			if (window.Blob && window.URL && window.URL.createObjectURL) {
				var csvData = new Blob([_utf + csvData], {
					type: 'text/csv'
				});
			}
			return URL.createObjectURL(csvData);
		},
		browser: function () {
			var Sys = {};
			var ua = navigator.userAgent.toLowerCase();
			var s;
			(s = ua.indexOf('edge') !== -1 ? Sys.edge = 'edge' : ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
				(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
					(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
						(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
							(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
								(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
			return Sys;
		}
	};


	class Page {
		constructor() {
			this.dom = {
				fileDom: document.querySelector("#files"),
				upFiles: document.querySelector(".upfiles"),
				yunDom: document.getElementsByClassName("yun"),
				load: document.querySelector("#status-load"),
				ok: document.querySelector("#status-ok"),
				tokenGet: document.querySelector(".token-get"),
				tokenOk: document.querySelector(".token-ok"),
				tokenErr: document.querySelector(".token-err"),
				currentSever: document.querySelector(".current-sever"),
				control: document.querySelector("#control"),
				dow: document.querySelector("#dow"),
			}
			this.token = '';
			this.gettingToken=false;
			this.domain = '';
			this.files = [];
			this.begin=false;
			this.init();
			this.fileObj=null;
			this.observable = null;
			this.index=0;
			this.urljson=[];
		}
		init() {
			this.getToken()
			this.bindEvent()
		}
		bindEvent() {
			this.dom.fileDom.onchange = (e) => {
				let files = this.dom.fileDom.files
				this.addFiles(files)
			}
			for (let i = 0; i < this.dom.yunDom.length; i++) {
				this.dom.yunDom[i].onclick=()=>{this.getToken();}
			}
			this.dom.control.onclick=()=>{
				this.begin?this.stop():this.start();
			}
			this.dom.upFiles.onclick=(ev)=>{
				let target = ev.target
				if(target.nodeName.toLocaleLowerCase()==="button"){
					this.cancel(target);
				}
			}
		}
		getToken() {
			if(this.gettingToken)return;
			this.gettingToken=true;
			this.token='';
			this.status('get');
			let serve = null;
			let yun = this.dom.yunDom;
			for (let i = 0; i < yun.length; i++) {
				if (yun[i].checked) {
					serve = yun[i].value;
				}
			}
			let xhr = null;
			if (window.XMLHttpRequest) {
				xhr = new window.XMLHttpRequest();
			} else {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
			let url='https://chenjiujiu.com/picUpload/serve/'+serve+'-token.php'
			xhr.open('get', url, true);
			xhr.send(null);
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4 && xhr.status === 200) {
					let res = JSON.parse(xhr.responseText);
					this.gettingToken=false;
					if (res.code) {
						this.token = res.uptoken;
						this.domain = res.domain;
						this.status('ok')
					} else {
						this.status('err');
					}
				}
			}
		}
		status(state) {
			if (state === "ok") {
				this.dom.currentSever.innerHTML = "https://" + this.domain+"/";
				this.dom.tokenGet.style.display = 'none';
				this.dom.tokenErr.style.display = 'none';
				this.dom.tokenOk.style.display = 'block';
			} else if (state === 'err') {
				this.dom.currentSever.innerHTML = "当前使用服务器:";
				this.dom.tokenGet.style.display = 'none';
				this.dom.tokenErr.style.display = 'block';
				this.dom.tokenOk.style.display = 'none';
			} else {
				this.dom.currentSever.innerHTML = "当前使用服务器:";
				this.dom.tokenGet.style.display = 'block';
				this.dom.tokenErr.style.display = 'none';
				this.dom.tokenOk.style.display = 'none';
			}
		}
		addFiles(files) {
			let domFrag=document.createDocumentFragment()
			for (let i = 0; i < files.length; i++) {
				this.files.push(files[i]);
				let newDom = document.createElement('tr')
				let file=files[i];
				newDom.setAttribute('data-id', file.name)
				newDom.innerHTML = `
				<td>
					${file.name}
				</td>
				<td>
					${(file.size / 1024 / 1024).toFixed(2)}M
				</td>
				<td>
					<div class="upfile-info">
						<div class="progress-box">
							<div class="progress">
								<div class="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar" style="width: 0%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">0%</div>
							</div>
						</div>
						<button class="upfile-close btn btn-sm btn-danger">X</button>
					</div>
					<div class="upfile-err"><span class="d-inline-block bg-danger"></span><span class="err-msg text-danger" data-name=file.name>取消上传</span></div>
					<div class="upfile-ok"><span class="d-inline-block bg-success"></span><a href="#" class="upfile-ok-link text-success">www.fwafwaf.fawef/fawf</a></div>
				</td>
				`;
				domFrag.appendChild(newDom)
			}
			this.dom.upFiles.appendChild(domFrag)
		}
		setButton(status) {
			if (status) {
				this.dom.control.innerHTML="暂停"
				this.dom.control.classList.remove('btn-info')
				this.dom.control.classList.add('btn-danger')
				this.dom.upFiles.dataset.state='stop';
			} else {
				this.dom.control.innerHTML="开始"
				this.dom.control.classList.remove('btn-danger')
				this.dom.control.classList.add('btn-info')
				this.dom.upFiles.dataset.state='begin';
			}
		}
		start(){
			this.begin=true;
			this.setButton(this.begin)
			this.upload();
			this.subscription = this.observable.subscribe(this.observer())
		}
		stop(){
			this.begin=false;
			this.setButton(this.begin)
			console.log("暂停")
			this.subscription.unsubscribe()
		}
		cancel(dom){
			let td = dom.parentNode.parentNode;
			let tr = td.parentNode;
			dom.parentNode.style.display = 'none';
			td.querySelector('.upfile-err').style.display = 'block';
			td.querySelector('.upfile-ok').style.display = 'none';
			td.querySelector('.err-msg').innerHTML = '已取消上传';
			let id=tr.dataset.id;
			this.files.forEach((item,index)=>{
				if(item.name===id){	this.files.splice(index,1)}
			})
		}
		set(code,data){
			let dom=this.dom.upFiles.querySelector("[data-id='"+this.files[this.index].name+"']");
			let info=dom.querySelector('.upfile-info')
			let err=dom.querySelector('.upfile-err')
			let ok=dom.querySelector('.upfile-ok')
			let link=dom.querySelector('.upfile-ok-link')
			if(code){
				let bar=dom.querySelector('.progress-bar')
				bar.innerHTML=data.toFixed(2)+'%';
				bar.style.width=data+'%';
				info.style.display='block'
				err.style.display='none'
				ok.style.display='none'
				if(data===100){
					info.style.display='none'
					err.style.display='none'
					ok.style.display='block'
					let alink='https://'+this.domain+'/'+this.files[this.index].name;
					link.innerHTML=alink;
					link.href=alink;
				}
			}else {
				info.style.display='none'
				err.style.display='block'
				ok.style.display='none'
				err.querySelector('.err-msg').innerHTML=data;
			}
		}
		upload(){
			this.observable = qiniu.upload(
				this.files[this.index],
				this.files[this.index].name,
				this.token, {}, {}
			)
		}
		observer(){
			let that=this;
			return{
				next(res){
					that.set(1,res.total.percent);
				},
				err(err){
					console.log("err:",err)
					that.set(0,"出错啦");
				},
				complete(res){
					let flink='https://'+that.domain+'/'+that.files[that.index].name;
					let fname=that.files[that.index].name;
					let id=that.index+1;
					that.urljson.push({
						id:id,
						name:fname,
						link:flink,
						state:"成功"
					})
					that.index++;
					if(that.index<that.files.length){
						that.upload();
						that.subscription = that.observable.subscribe(that.observer())
					}else{
						that.allEnd()
					}

				}
			}
		}
		allEnd() {
			this.dom.dow.style.display = 'inline-block'
			let urljson = this.urljson
			JSonToCSV.setDataConver({
				data: urljson,
				fileName: '云图片链接列表',
				columns: {
					title: ['序号', '名字', '链接', '状态'],
					key: ['id', 'name', 'link', 'state']
				}
			},this.dom.dow)
		}
	}

	 new Page();

}
