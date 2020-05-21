var db;
var id='n',uname='n';
var dev='n';
var title="Survey";
var mymap;
var actuallat;
var actuallon;
var capamarcador;

if(/(android)/i.test(navigator.userAgent)){
	dev='android';
}else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)){
	dev='ios';
}else{
	dev='other';
}
function resize(){
	if($(window).height()>$(window).width()){
		document.body.style.fontSize=Math.floor(16*$(window).height()/937)+"px";
	}else{
		document.body.style.fontSize=Math.floor(15*$(window).width()/937)+"px";
	}
	$(".overlay").css("min-height",$(window).height()+'px');
	$('#main').trigger( "updatelayout" );
}

function round_to_precision(value, precision) {
    var precision = precision || 0,
        power = Math.pow(10, precision),
        absValue = Math.abs(Math.round(value * power)),
        result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

    if (precision > 0) {
        var fraction = String(absValue % power),
            padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
        result += '.' + padding + fraction;
    }
    return result;
}

function backKeyDown() {
    navigator.notification.confirm("Desea salir de APCollector?", onConfirm, "Salir", "Yes,No"); 
}
function onConfirm(button) {
    if(button==2){//If User selected No, then we just do nothing
        return;
    }else{
		if (navigator.app) {
			navigator.app.exitApp();
		} else if (navigator.device) {
			navigator.device.exitApp();
		} else {
			window.close();
		}
    }
}

function cookie(code){
	return window.localStorage.getItem(code);
}
function setCookie(code,val){
	window.localStorage.setItem(code,val);
}
if(cookie('F_userid')==null){
	id=uniq();
	setCookie('F_userid',id);
}else{
	id=cookie('F_userid');
}
function changeSelect(id,val){
	$('#'+id+' option').prop('selected', false)
					   .filter('[value="'+val+'"]')
					   .prop('selected', true);
	$('#'+id+'').selectmenu("refresh", true);
}
function flip(id,val){
	$('#'+id).val(val).slider("refresh");
}

function init()
{
	resize();
	if(dev!='android'){
		FastClick.attach(document.body);
	}else{
		$("select").on('vmousedown', function(e) { $(this).focus().click(); });
	}
	$('.ui-panel-dismiss').click(
		function(){$("#left-panel").panel("close");}
	);
	$( "input[type=text],input[type=number],textarea" ).focus(function() {
		setTimeout(function(){$('.popup').popup('reposition', 'positionTo: window');},500);
	});
	$( "input[type=text],input[type=number],textarea" ).blur(function() {
		setTimeout(function(){$('.popup').popup('reposition', 'positionTo: window');},500);
	});
	$(document).on("popupafteropen", function() {
	    setTimeout(function(){$('.popup').popup('reposition', 'positionTo: window')},200);
	});
	initDB();
	if(cookie('F_username')==null){
		openPopup('loginpop');
	}else{
		uname=cookie('F_username');
		_('unamewrap').innerHTML="Actualmente est&aacute;s conectado como <b>"+uname+"</b>.";
	}


	var basemaps = 
	{	
		Streets: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
		{
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		})
	};

	mymap = L.map('mapid',
	{
		zoom: 10
	}).setView([3.42335,-76.52086], 13);
	basemaps.Streets.addTo(mymap);
	capamarcador = L.marker([3.42335,-76.52086]).addTo(mymap).bindPopup("<b>Posici&oacute;n Actual</b>").openPopup();
	mymap.setView([actuallat , actuallon ], 13, { animation: true });
	L.control.groupedLayers(basemaps).addTo(mymap);
}

function login(){
	uname=_('unametxt').value;
	_('unamewrap').innerHTML="You are currently logged in as "+uname+".";
	setCookie("F_username",uname);
	closePopup('loginpop');
	_('unametxt').value='';
}
function uniq() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4()+S4());
}
function _(id) {
	return document.getElementById(id);
}
function openPopup(id){
	$('#'+id).popup('open',{transition: 'pop'});
}
function closePopup(id){
	$('#'+id).popup('close',{transition: 'pop'});
}
Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString();
	var dd  = this.getDate().toString();
	return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) + '-'+(dd[1]?dd:"0"+dd[0]);
};
function switchPop(fid,sw){
	closePopup(fid);
	setTimeout(function(){openPopup(sw)},500);
}
function openPage(id){
	$('.apppage').hide();
	$('#'+id).show();
}
function check(id,c){
	if(c==1){
		$("#"+id+'y').prop("checked",true).checkboxradio("refresh");
		$("#"+id+'n').prop("checked",false).checkboxradio("refresh");
	}else{
		$("#"+id+'y').prop("checked",false).checkboxradio("refresh");
		$("#"+id+'n').prop("checked",true).checkboxradio("refresh");
	}
	_(id).innerHTML=c;
}
function resetForm(){
	$("input[type='checkbox']").prop("checked",false).checkboxradio("refresh");
	$(".checks").html('');
	$(".inputs").val('');
	reloadCoords();
}
function otherCheck(id){
	if(_(id).value=='other'){
		$('#'+id+'other').show();
	}else{
		$('#'+id+'other').hide();
	}
}
function checkemail(mail){
	var em = _(mail);
	var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!filter.test(em.value)) {
		// bad email
		return false;
	} else {
		return true;
	}
}
function alertPop(msg,title){
	_('alerth').innerHTML=title;
	_('alertIn').innerHTML=msg;
	openPopup("alertpop");
}
function save()
{
	var uniqe = uniq();
	var sql=`insert into encuestas (id,uid,uname,created,datos,sent)
	 VALUES ('${uniqe}', '${id}', '${uname}', datetime('now','localtime') `;
	var nocomp=true;

	var datos="{";
	//datos+="latitude:"+$("#latitude").val()+",";
	//datos+="longitude:"+$("#longitude").val()+",";

	$('.cajas').find('input').each(function(i,e){
		if($(e).prop("value")){
			datos+=`"${this.id}":"${$(e).val()}",`;
		}else
		{
			datos+=`"${this.id}":"-",`;
		}
	});

	$('.listado').find('option:selected').each(function(i,e){
		datos+=`"${$(e).data("id")}":"${$(e).val()}",`;
	});

	
	$('.checks').each(
		function(i,e){
			if($(e).html()==''){
				nocomp=false;
				console.log(e);
			}else{
				var v=Number($(e).html());
				datos+=`"${this.id}":${v},`;
			}
		}
	);

	$('.unir').find('input').each(function(i,e){
		var u=0;
		if($(e).prop("checked")){
			u=1;
		}
		datos+=`"${this.id}":${u},`;
	});

	datos=datos.substring(0, datos.length - 1);
	datos+="}";

	sql+=`,'${datos}',0);`;

	// Check if at least yes or no was clicked
	/*$('.checks').each(
		function(i,e){
			if($(e).html()==''){
				nocomp=false;
				console.log(e);
			}else{
				var v=Number($(e).html());
				var s=","+v;
				sql+=s;
			}
		}
	)
	$('.unir').find('input').each(function(i,e){
		var u=0;
		if($(e).prop("checked")){
			u=1;
		}
		var s=","+u;
		sql+=s;
	});
	var p=$('#postcode').val();
	var age=$('#age').val();
	if(p.length<1||age.length<1){
		nocomp=false;
	}
	if(!nocomp){
		alertPop("Please complete the survey.","Action Required");
		return false;
	}
	sql+=",'"+p+"','"+age+"',0)";*/
	addSurvey(sql);
}

var onSuccess = function(position) 
{
    $("#latitude").val(round_to_precision(position.coords.latitude,9));
	$("#longitude").val(round_to_precision(position.coords.longitude,9));

	actuallat = position.coords.latitude;
	actuallon = position.coords.longitude;

    console.log('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
			  'Timestamp: '         + position.timestamp                + '\n');
	if(mymap instanceof Object )
	{
		capamarcador.setLatLng([actuallat, actuallon]).update();
		mymap.flyTo([actuallat, actuallon], 16);
	}
};

// onError Callback receives a PositionError object
//
function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
}

function reloadCoords()
{
	navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 30000 });
}
