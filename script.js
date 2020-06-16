window.addEventListener("load",setupPage,false);
document.getElementById("about").addEventListener("mouseover",showAbout,false);
document.getElementById("about").addEventListener("mouseout",hideAbout,false);

function showAbout(e){
  document.getElementById("explain").style.display="block";
}
function hideAbout(e){
  document.getElementById("explain").style.display="none";
}

//==========================  SETUP GLOBAL VARIABLES  =============================
let insert=0,composite_array,component_array,chosen_wave,last_array,fourier_amp,fourier_constant,fourier_freq,fourier_term,fourier_sum,fourier_term_inc,max_runs,fourierFunc;
let SIN="SIN",COS="COS";
let TWO_PI= 2 * Math.PI;
let TRIANGLE_CONSTANT= 8/Math.pow(Math.PI,2);
let SQUARE_CONSTANT= 4/Math.PI;
let RIGHT_TRIANGLE_CONSTANT=  1/2 - 1/Math.PI;
//==========================================================================
//==========================  GET ELEMENTS  ================================
let add_art= document.getElementById("add_art");
let comp_art= document.getElementById("comp_art");
let INSERTS= document.getElementById("all_art");
let func_choice= document.getElementById("function");
let freq_choice= document.getElementById("freq");
let amp_choice= document.getElementById("amp");
let draw_it= document.getElementById("draw");
let add_it= document.getElementById("add");
let comp_can= document.getElementById("comp_can"),comp_can_ctx= comp_can.getContext("2d");
let add_can= document.getElementById("add_can");add_can_ctx= add_can.getContext("2d");
//==========================================================================
//==========================  ADD EVENT HANDLER  ===========================
freq_choice.addEventListener("input",drawComponent,false);
amp_choice.addEventListener("input",drawComponent,false);
func_choice.addEventListener("change",drawComponent,false);
draw_it.addEventListener("click",drawComponent,false);
add_it.addEventListener("click",addComponent,false);
//==========================================================================
function setupPage(){
	canvas_width= 600;
	canvas_height= Math.floor( canvas_width / 2 );
	canvas_width_half=canvas_width/2;
	canvas_height_half= canvas_height/2;
	RAD_INC= (TWO_PI / canvas_width);
	//===========================================================================
	composite_array= new Array(canvas_width);
	component_array= new Array(canvas_width);
	comp_can.width=add_can.width= canvas_width;
	comp_can.height=add_can.height= canvas_height;
	add_can_ctx.translate(0,canvas_height/2);add_can_ctx.scale(1,-1);
	comp_can_ctx.translate(0,canvas_height/2);comp_can_ctx.scale(1,-1);
	add_can_ctx.fillStyle="black";add_can_ctx.strokeStyle="red";
	comp_can_ctx.fillStyle="black";comp_can_ctx.strokeStyle="yellow";
	//===========================================================================
	for(let i=0; i < composite_array.length; i++){
		composite_array[i]=0;
	}
	clearCanvas(add_can_ctx);
	clearCanvas(comp_can_ctx);
}
function addComponent(){
  let px;
	if( last_array == undefined )
		return;
	for(let i=0; i < composite_array.length; i++){
		composite_array[i]+= last_array[i];
	}
	clearCanvas(comp_can_ctx);
	//===================   DRAW WAVE   ===========================
	comp_can_ctx.beginPath();
  comp_can_ctx.moveTo(-1,composite_array[0]);

	for(px=0; px < composite_array.length; px++){
		comp_can_ctx.lineTo(px,composite_array[px] );
	}
	comp_can_ctx.lineTo(px,0 );
	comp_can_ctx.stroke();
	comp_can_ctx.closePath();
	//====================  ADD DATA  ================================
	let id= amp_choice.value + ":" + chosen_wave + ":" + freq_choice.value;
	let node= document.createElement("p");
	node.className="added_wave";
	let html= 'Added Wave= ' + amp_choice.value + ' * ' + chosen_wave + '( ' + freq_choice.value + ' )<br/>';
  html+= '<input type="button" id="show_' + id +'" value= "Show Wave" />';
  //html+= '<input type="button" id="remove_' + id + '" value= "Remove Wave" />';
	node.innerHTML= html;
	INSERTS.appendChild(node);
  document.getElementById("show_"+id).addEventListener("click",showWave,false);
  //document.getElementById("remove_"+id).addEventListener("click",removeWave,false);
	insert++;
}

function removeWave(e){
	let string=this.id;
	let amp=string.slice(string.indexOf("_")+1,string.indexOf(":"));
	let freq=string.slice(string.lastIndexOf(":")+1);
	let func=string.slice(string.indexOf(":")+1,string.lastIndexOf(":"));
	//also add identifier index counter for every wave added so as to avoid duplicate waves
	console.log(this,e)
}

function showWave(e){
	let string=this.id;
	let amp=string.slice(string.indexOf("_")+1,string.indexOf(":"));
	let freq=string.slice(string.lastIndexOf(":")+1);
	let func=string.slice(string.indexOf(":")+1,string.lastIndexOf(":"));
	amp_choice.value=amp;
	freq_choice.value=freq;
	func_choice.value=func;
	drawComponent();

}
function drawComponent(e){
	let chosen_amp=amp_choice.value * canvas_height_half;
	let chosen_freq=freq_choice.value * RAD_INC;
	chosen_wave=func_choice.value;
	let array=[];
	switch(chosen_wave){
		case SIN:
			array= sinWave(chosen_amp,chosen_freq);
			break;
		case COS:
			array= cosWave(chosen_amp,chosen_freq);
			break;
		case chosen_wave:
			fourier_amp= chosen_amp;
			fourier_freq= chosen_freq;
			fourier_term=1;
			fourier_sum=[];
			for(let init=0; init < canvas_width; init++)
				fourier_sum[init]=0;
			if(chosen_wave == "Fourier Square"){
				fourier_constant= SQUARE_CONSTANT;
				fourier_term_inc=2;
				max_runs=500;
				fourierFunc=fourierSquare;
				fourierSeries();
			}
			else if(chosen_wave ==  "Fourier Triangle"){
				fourier_constant= TRIANGLE_CONSTANT;
				fourier_term_inc=2;
				max_runs=30;
				fourierFunc=fourierTriangle;
				fourierSeries();
			}
			else if(chosen_wave ==  "Fourier Right Triangle"){
				fourier_constant= RIGHT_TRIANGLE_CONSTANT
				fourier_term_inc=1;
				max_runs=500;
				fourierFunc=fourierRightTriangle;
				fourierSeries();
			}
			break;
	  	default:
			break;
	}
	//===================  DRAW WAVE   ===============================
	clearCanvas(add_can_ctx);
	add_can_ctx.beginPath();
	add_can_ctx.moveTo(-1,array[0]);
	for(let px=0; px < canvas_width; px++){
		add_can_ctx.lineTo(px,(array[px]) );
	}
	add_can_ctx.stroke();
	add_can_ctx.closePath();
	//================================================================
	last_array=array;
}
function sinWave(amp,omega){
	let a=[],displacement;
	for(let t=0; t < canvas_width; t++){
		displacement= amp * Math.sin( omega * t);
		a[t]= displacement;
	}
	return a;
}
function cosWave(amp,omega){
	let a=[],displacement;
	for(let t=0; t < canvas_width; t++){
		displacement= amp * Math.cos( omega * t);
		a[t]= displacement;
	}
	return a;
}
function fourierSeries(){
	clearCanvas(add_can_ctx);
	let array= fourierFunc();
	add_can_ctx.beginPath();
	add_can_ctx.moveTo(0,array[0]);
	for(let px=0; px < array.length; px++){
		let y= fourier_constant * array[px];
		fourier_sum[px]+=array[px];
		add_can_ctx.lineTo(px,(fourier_sum[px]) );
	}
	add_can_ctx.stroke();
	add_can_ctx.closePath();
	if(fourier_term < 16){
		setTimeout(fourierSeries,500);
	}
	else if(fourier_term < max_runs){
		setTimeout(fourierSeries,20);
	}
	last_array=fourier_sum;
	fourier_term+=fourier_term_inc;
}
function fourierTriangle(){
	let amp= fourier_amp * Math.pow(-1,(fourier_term-1)/2) / Math.pow(fourier_term,2);
	let freq= fourier_freq * fourier_term;
	return sinWave(amp,freq);
}
function fourierSquare(){
	let amp= fourier_amp / fourier_term;
	let freq= fourier_freq * fourier_term;
	return sinWave(amp,freq);
}
function fourierRightTriangle(){
	let amp= fourier_amp / fourier_term;
	let freq= fourier_freq * fourier_term;
	return sinWave(amp,freq);
}
function clearCanvas(obj){
	obj.fillRect(0,0,canvas_width,canvas_width);
	obj.fillRect(0,0,canvas_width,-canvas_width);
	let saved_color=obj.strokeStyle;
	obj.strokeStyle="#FFFFFF";
	obj.beginPath();
	obj.moveTo(0,0);
	obj.lineTo(canvas_width,0);
	obj.moveTo(canvas_width/2,-canvas_height);
	obj.lineTo(canvas_width/2,canvas_height);
	obj.stroke();
	obj.closePath();
	obj.strokeStyle= saved_color;
}