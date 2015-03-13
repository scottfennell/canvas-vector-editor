/**

VectorNote.js

@author Scott Fennell
@version 0.01

This software is licensed under the The GNU Lesser General Public License (LGPLv3)

example usage, call onLoad on the page load, with an html page with a canvas element named 'CanvasElement'

	function onLoad(){
		var width = window.innerWidth-2;
		var height = window.innerHeight-2;
		var canvas = document.getElementById('CanvasElement');
		canvas.width = width;
		canvas.height = height;
		canvas.vect = new VectorEditor(canvas);
	}
*/

function VectorEditor(canvasElem){
	canvasElem.vedit = this; 
	//this.isDrag = false;
	//this.isHover = false;
	//this.dragHandle = null;
	//this.lockCurves = true; //
	this.canvas = canvasElem;
	this.ctx = null;//canvas 2d element\n		
	if (this.canvas.getContext){
		  this.ctx = this.canvas.getContext('2d');
	}else{
		return false;
	}
	//Create elements
	this.elem = []
	
	this.path = new Path();
	this.elem.push(new Button({x:0,y:0,tool:'circle',parent:this})); 
	this.elem.push(new Button({x:0,y:50,tool:'path',parent:this})); 
	this.elem.push(new Button({x:0,y:100,tool:'selection',parent:this})); 
	
	
	this.key = false;
	this.keyCode = 0;
	this.currentTool = "path";
	
	//for simplicity, just crete the path and use only that
	
	this.moveListener = function(ev){
		
		var ve = ev.target.vedit;
		ve.pointerX = ev.pageX-ve.canvas.offsetLeft;
		ve.pointerY = ev.pageY-ve.canvas.offsetTop;
		ve.ctx.clearRect(0,0,ve.canvas.width, ve.canvas.height);
		//update  path with all move events
		ve.path.mmove(ve.pointerX,ve.pointerY);
		ve.path.draw(ve.ctx,ve.currentTool);
		//update elements
		for(var i=0; i<ve.elem.length; i++){
			ve.elem[i].mmove(ve.pointerX,ve.pointerY);
			ve.elem[i].draw(ve.ctx,ve.currentTool);
		}
		
	}
	
	this.mouseClick = function(ev){
		var ve = ev.target.vedit;
		var hov = false;
		//ve.path.mclick(ve.pointerX,ve.pointerY);
		for(var i=0; i<ve.elem.length; i++){
			if(!ve.elem[i].mclick(ve.pointerX,ve.pointerY)){
				alert('clicker stop');
				hov = true;
				break;
			}	
		}
		if(!hov) ve.path.mclick(ve.pointerX,ve.pointerY);
	}
	
	this.mouseDownListener = function(ev){
		var ve = ev.target.vedit;
		var hov = false;
		for(var i=0; i<ve.elem.length; i++){
			//Dont continue if false, the action should be captured
			if(!ve.elem[i].mdown(ve.pointerX,ve.pointerY)){
				hov = true;
				break;
			}	
		}
		if(!hov){
			if(ve.currentTool == "path"){
				ve.path.mdown(ve.pointerX,ve.pointerY,{'key':this.keyCode});	
			}else if(ve.currentTool == "circle"){
				ve.elem.push(new Circle(ve.pointerX,ve.pointerY));
			}	
		}
		
	}
	
	this.mouseUpListener = function(ev){
		var ve = ev.target.vedit;
		ve.path.mup(ve.pointerX,ve.pointerY);
		for(var i=0; i<ve.elem.length; i++){
			//Dont continue if false, the action should be captured
			ve.elem[i].mup(ve.pointerX,ve.pointerY)		
		}
	}
	
	this.mouseOut = function(ev){
		var ve = ev.target.vedit;
		//fire mouse up on mouse out
		ve.mouseUpListener(ev);
		
	}
	
	this.keyDown = function(ev){
		var ve = ev.target.vedit;
		this.keyCode = ev.keyCode;
		this.key = true;
	}
	
	this.keyUp = function(ev){
		var ve = ev.target.vedit;
		this.keyCode = 0;
		this.key = false;
	}
	
	this.changeTool = function(tname){
		if(this.currentTool != tname){
			this.currentTool = tname;
		}
	}
	
	this.canvas.onmousemove = this.moveListener;
	this.canvas.onmousedown = this.mouseDownListener;
	this.canvas.onmouseup = this.mouseUpListener;
	this.canvas.onmouseout = this.mouseOut;
	this.canvas.onmouseclick = this.mouseClick;
	this.canvas.ownerDocument.onkeydown = this.keyDown;
	this.canvas.ownerDocument.onkeyup = this.keyUp;
	
	console.log(this.canvas);
}



function Button(config){
	

	this.xloc = config.x;
	this.yloc = config.y; 
	this.width = 50;
	this.height = 50;
	this.toolName = config.tool;
	
	this.hover = false;
	
	this.parent = config.parent;
	
	this.draw = function(ctx){
		//draw
		ctx.lineWidth = 1;
		ctx.strokeStyle = "rgb(128,128,128)";
		ctx.strokeRect(this.xloc,this.yloc,this.width,this.height);
		if(this.hover){
			ctx.fillStyle = "rgb(64,64,64)";
			ctx.fillRect(this.xloc+1,this.yloc+1,this.width-2,this.height-2);
		}
	}
	
	this.mmove = function(x,y){
		if((x>this.xloc && x<(this.xloc + this.width)) && ((y>this.yloc)&&(y<(this.yloc + this.height)))){
			this.hover = true;
		} else {
			this.hover = false;
		}
	}
	
	this.mdown = function(x,y){
		if(this.hover){
			if(this.parent != null){
				this.parent.changeTool(this.toolName);
			}
			
			return false;
			//do stuff
		}else{
			return true;
		}
	}
	
	this.mup = function(x,y){
		
	}
	
	
	
}

function Circle(x,y){
	this.x = x;
	this.y = y;
	this.rad = 0;
	this.drag = true;
	this.hoverPoint = 1;
	this.contx = x;
	this.conty = y;
	this.ctool = '';
	
	this.grabRadius = 6;
	this.endArc = Math.PI*2;
	this.handleFillColor = "rgb(128,128,128)";
	this.bezLineColor = "rgb(200,200,200)";
	this.handleBoxColor = "rgb(128,128,128)";
	this.pointHandleFillColor = "rgba(255,0,0,0.5)";
	this.circleFillColor = "rgba(128,128,128,0.2)";
	this.pointHandleStrokeColor = "rgba(255,128,0,0.5)"; ;
	
	this.draw = function(ctx){
		if(arguments.length >1){
			this.ctool = arguments[1];
			if(arguments[1]=='circle'){
				this.drawControls(ctx);
			}else if(arguments[1] =='selection'){
				this.drawBox(ctx);
			}
		}else{
			this.drawControls(ctx);
		}
			
		ctx.fillStyle = this.circleFillColor;
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.rad,0,this.endArc, false);
		ctx.fill();
		
	}
	
	this.mdown = function(x,y){
		if(this.hover){
			this.drag = true;
			return false;
		}else{
			return true;
		}
	}
	
	this.mmove = function(x,y) {
		if(this.drag){
			if(this.hoverPoint == 1){
				this.contx = x;
				this.conty = y;
				this.getRad();
			}else{
				var dx = this.x - this.contx;
				var dy = this.y - this.conty;
				
				this.x = x;
				this.y = y;
				this.contx = this.x - dx;
				this.conty = this.y - dy;
				
			}

		}else{
			this.checkHover(x,y);
		}
	}
	
	this.mup = function(x,y) {
		this.drag = false;
	}
	
	this.getRad = function(){
		var xdist = this.x-this.contx;
		xdist = xdist*xdist;
		var ydist = this.y-this.conty;
		ydist = ydist*ydist;
		
		this.rad = Math.sqrt(xdist+ydist);
		return this.rad;
	}
	
	this.drawBox = function (ctx){
		if(this.hover){
			ctx.strokeStyle = this.handleBoxColor;
			//Draw a rectange for the bezier point grab box
			ctx.strokeRect(
				this.x-this.rad,
				this.y-this.rad,
				this.rad*2,
				this.rad*2);
		}
	}
	
	this.drawControls = function (ctx){
		ctx.fillStyle = this.handleFillColor; 
		if(this.hover){
			//fill only the hovered, stroke both
			if(this.hoverPoint == 2){
				ctx.fillRect(
					this.x-5,
					this.y-5,
					10,
					10);
			}else if(this.hoverPoint == 1){
				this.fillStyle = this.pointHandleFillColor;
				ctx.beginPath();
				ctx.arc(this.contx,this.conty,this.grabRadius,0,this.endArc, false);
				ctx.fill();
			}
		}
		
		ctx.strokeStyle = this.handleBoxColor;
		//Draw a rectange for the bezier point grab box
		ctx.strokeRect(
			this.x-5,
			this.y-5,
			10,
			10);
			
		ctx.strokeStyle = this.pointHandleStrokeColor;
		ctx.beginPath();
		ctx.arc(this.contx,this.conty,this.grabRadius,0,this.endArc, false);
		ctx.stroke();
	}
	
	this.checkHover = function(x,y){
		if(this.ctool == 'selection'){
			var xdist = this.x-x;
			xdist = xdist*xdist;
			var ydist = this.y-y;
			ydist = ydist*ydist;
			
			var dist = Math.sqrt(xdist+ydist);
			if(dist < this.rad){
				this.hover = true;
				this.hoverPoint = 0;
			}else{
				this.hover = false;
			}
		}else{
	
			if(this.prox(this.contx,this.conty,x,y)){
				this.hover = true;
				this.hoverPoint = 1;
			}else if (this.prox(this.x,this.y,x,y)){
				this.hover = true;
				this.hoverPoint = 2;
			}else{
				this.hover = false;
				this.hoverPoint = 0;
			}
		}
	}
	
	this.prox = function(pnt1x, pnt1y, pnt2x, pnt2y){
		
		//pythagoream
		if((Math.abs((pnt1x-pnt2x))<=this.grabRadius) &&
			(Math.abs(pnt1y-pnt2y)<=this.grabRadius)){
			return true;
		}else{
			return false;
		}
	}
	
}


//Vector element parent class...
function VectorElement(){
		
	this.draw = function(ctx){}
	this.isHover = function(x,y){}
	
	//may not recieve all mouse movements
	this.mdown = function(x,y){}
	this.mup = function(x,y){}
	this.mmove = function(x,y){}
	
}

function Path(){
	
	this.points = [];//vector points starting from first to last
	this.closed = false;
	this.hovering = false;
	this.hoverPoint = -1;
	this.drag = false;
	this.edit = true;
	this.drawControls = true;
	
	
	this.pathColor =  "rgb(128,128,128)";
	
	this.draw = function(ctx){
		if(arguments.length > 1){
			if(arguments[1] == 'path'){
				this.drawControls = true;
			}else{
				this.drawControls = false;
			}
		}else{
			this.drawControls = true;
		}
		this.ctx = ctx;
		this._draw();
	}
	
	this._draw = function(){
		//loop through points and draw the path here
		if(this.points.length < 1)return;
		var openPoint = this.points[0].getToBezPoints();//[x,y,bezx,bezy]
		this.ctx.strokeStyle = this.pathColor;
		this.ctx.beginPath();
		this.ctx.moveTo(openPoint[0],openPoint[1]);
		for(var i = 1; i<this.points.length; i++){
			var last = this.points[i-1].getFromBezPoints();
			var curr = this.points[i].getToBezPoints();
			this.ctx.bezierCurveTo(last[0],last[1], curr[2], curr[3], curr[0], curr[1]);
		}
		this.ctx.stroke();
		
		if(this.drawControls){
			//draw edit details
			for(var i = 0; i<this.points.length; i++){
				this.points[i].draw(this.ctx);
			}
		}		
	}
	
	this.mmove = function(mx,my){
		//assume that we have been called from the object - so we can use this
		if(this.drag){
			this.points[this.hoverPoint].mmove(mx,my);
		}else{
			//dont look
			for(var i=0; i<this.points.length; i++){
				if(this.points[i].isHover(mx,my)){
					this.hovering = true;
					this.hoverPoint = i;
					break;//dont allow to select more than one item
				}else{
					this.hovering = false;
					this.hoverPoint = -1;
				}
			}
		}
	} 
	
	this.mdown = function(mx,my){
		
		if(this.hovering){
			this.drag = true;
		}else{
						
			//create new point
			var np = new VectorPoint(mx,my);
			this.points.push(np);
			this.hovering = true;
			this.hoverPoint = this.points.length-1;
			this.drag = true;
		}
	}
	
	this.mup = function(mx,my){
		if(this.drag){
			this.drag = false;
		}
	}
	
	this.mclick = function(mx,my){
		this.drag=false;
	}

}

function VectorPoint(x,y){
	this.grabRadius = 6;
	this.endArc = Math.PI*2;
	this.handleFillColor = "rgb(128,128,128)";
	this.bezLineColor = "rgb(200,200,200)";
	this.handleBoxColor = "rgb(128,128,128)";
	this.pointHandleFillColor = "rgba(255,0,0,0.5)";
	this.pointHandleStrokeColor = "rgba(255,128,0,0.5)"; ;
	
	this.x = x;
	this.y = y;
	
	this.bezPreX = x;
	this.bezPreY = y;
	
	this.bezPostX = x;
	this.bezPostY = y;
	
	this.corner = false; // lock the two points
	
	this.next = null;

	//start with the post point dragging	
	this.hoverPoint = 2;// 1 is bezPre, 2bezPost, 3 point
	this.hovering = true;
	
	//Draw the editor part of this line
	this.draw = function(ctx){
		ctx.strokeStyle = this.bezLineColor;
		ctx.beginPath();
		ctx.moveTo(this.x,this.y)	
		ctx.lineTo(this.bezPreX,this.bezPreY);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.bezPostX,this.bezPostY);
		ctx.stroke()
		//check for proximity to points
		
		ctx.fillStyle = this.handleFillColor; 
		if(this.hovering){
			//fill only the hovered, stroke both
			if(this.hoverPoint == 1){
				ctx.fillRect(
					this.bezPreX-5,
					this.bezPreY-5,
					10,
					10);
			}else if(this.hoverPoint == 2){
				ctx.fillRect(
					this.bezPostX-5,
					this.bezPostY-5,
					10,
					10);
			}else if(this.hoverPoint == 3){
				this.fillStyle = this.pointHandleFillColor;
				ctx.beginPath();
				ctx.arc(this.x,this.y,this.grabRadius,0,this.endArc, false);
				ctx.fill();
			}
		}
		ctx.strokeStyle = this.handleBoxColor;
		//Draw a rectange for the bezier point grab box
		ctx.strokeRect(
			this.bezPreX-5,
			this.bezPreY-5,
			10,
			10);
		ctx.strokeRect(
			this.bezPostX-5,
			this.bezPostY-5,
			10,
			10);
			
		ctx.strokeStyle = this.pointHandleStrokeColor;
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.grabRadius,0,this.endArc, false);
		ctx.stroke();
		
	}
	
	this.getToBezPoints = function(){
	
		//return the bez points when we are drawing to this point
		/*
			this.ctx.bezierCurveTo(
				this.pointList[i][0],//not me
				this.pointList[i][1],//not me
				this.pointList[i][2],//my bez pointx
				this.pointList[i][3],//my bez pointy
				this.pointList[i][4],//my x
				this.pointList[i][5] //my y
			);
		*/
		//return [this.bezPreX,this.bezPreY,,this.x,this.y];
		return [this.x,this.y,this.bezPreX,this.bezPreY,];
	}
	
	this.getFromBezPoints = function(){
		//return the bez points when we are drawing away
		//post
		return [this.bezPostX, this.bezPostY];
	}

	
	//pass mouse x and mouse y - check if we are hovering over any points, 
	this.isHover = function(mx, my){
		//check all points, if any is true, set internal hover 
		if(this.prox(this.bezPostX,this.bezPostY,mx,my)){
			//select post first if there is an overlap
			this.hovering=true;
			this.hoverPoint = 2;
		}else if(this.prox(this.bezPreX,this.bezPreY,mx,my)){
			this.hovering=true;
			this.hoverPoint = 1;
		}else if(this.prox(this.x,this.y,mx,my)){
			this.hovering=true;
			this.hoverPoint = 3;
		}else{
			this.hovering = false;
			this.hoverPoint = 0;
		}
		return this.hovering;
	}
	
	this.mmove = function(mx,my){
		//you are being told about this because you said i was hovering
		if(this.hovering){
			switch (this.hoverPoint){
				case 1:
					this.bezPreX = mx;
					this.bezPreY = my;
					this.calcPostFromPre();
					break;
				case 2:
					this.bezPostX = mx;
					this.bezPostY = my;
					this.calcPreFromPost();
					break;
				case 3:
					//save last points to calc the new bez
					this.postx = this.x; 
					this.x = mx;
					this.posty = this.y;
					this.y = my;
					this.calcBezFromPoint();
					break;
				default:
					this.hovering = false;
			}
		}
	}
	
	this.calcPostFromPre = function(){
		//get the pre  and move the post point to match it if this is not a corner
		if(!this.corner){
			this.bezPostX = (2*this.x)-this.bezPreX;
			this.bezPostY = (2*this.y)-this.bezPreY;
		}
	}
	
	this.calcPreFromPost = function(){
		if(!this.corner){
			this.bezPreX = (2*this.x)-this.bezPostX;
			this.bezPreY = (2*this.y)-this.bezPostY;
		}
	}
	
	this.calcBezFromPoint = function(){
		//move the bez point the same amount that the point had moved 
		this.bezPreX += (this.x-this.postx);
		this.bezPreY += (this.y-this.posty);
		this.bezPostX += (this.x-this.postx);
		this.bezPostY += (this.y-this.posty);
	}
	
	this.prox = function(pnt1x, pnt1y, pnt2x, pnt2y){
		
		//pythagoream
		if((Math.abs((pnt1x-pnt2x))<=this.grabRadius) &&
			(Math.abs(pnt1y-pnt2y)<=this.grabRadius)){
			return true;
		}else{
			return false;
		}
	}

}
