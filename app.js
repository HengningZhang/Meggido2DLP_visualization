var canvasWidth = 1500;
var canvasHeight = 1000;
var canvas = null;
var bounds = null;
var ctx = null;
var hasLoaded = false;

var startX = 0;
var startY = 0;
var mouseX = 0;
var mouseY = 0;
var isDrawing = false;
var existingLines = [];

var existingUpper=[];
var existingLower=[];
// existingUpper/Lower contains straight lines (for drawing)
var upperConstraints = [];
var gotUpper = false;
var lowerConstraints = [];
var gotLower = false;
// upperConstraints and lowerConstraints contains points that define the straight lines
var remainingLower = [];
var existingPairs=[];
var optimal_point=null;
var optimal_line=null;

canvas = document.getElementById("canvas");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.onmousedown = onmousedown;
canvas.onmouseup = onmouseup;
canvas.onmousemove = onmousemove;

bounds = canvas.getBoundingClientRect();
ctx = canvas.getContext("2d");
hasLoaded = true;
draw();

function median(arr){
    arr.sort(function(a, b){return a-b})
    return arr[parseInt(arr.length/2)]
}

function draw() {
    ctx.fillStyle = "#333333";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (var i = 0; i < existingUpper.length; ++i) {
        var line = existingUpper[i];
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
    }
    
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = "green";
    for (var i = 0; i < existingLower.length; ++i) {
        var line = existingLower[i];
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
    }
    
    ctx.stroke();

    if (isDrawing) {
        ctx.strokeStyle = "darkred";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX,startY);
        ctx.lineTo(mouseX,mouseY);
        ctx.stroke();
    }
}

function onmousedown(e) {
    if(!gotLower || !gotUpper){
        if (hasLoaded && e.button === 0) {
            if (!isDrawing) {
                startX = e.clientX - bounds.left;
                startY = e.clientY - bounds.top;
                
                isDrawing = true;
            }
            
            draw();
        }
    }
        
    
}

function onmouseup(e) {
    if(!gotLower || !gotUpper){
        if (hasLoaded && e.button === 0) {
            if (isDrawing) {
                curpoint=[startX,startY*(-1),mouseX,mouseY*(-1)]
                coeff=process_line(startX,startY*(-1),mouseX,mouseY*(-1))
                fullLine=get_full_line(coeff[0],coeff[1])
                

                if(!gotUpper){
                    upperConstraints.push(coeff)
                    existingUpper.push(fullLine)
                }
                else{
                    lowerConstraints.push(coeff)
                    existingLower.push(fullLine)
                }
                
                console.log(startX,startY*(-1),mouseX,mouseY*(-1))
                isDrawing = false;
            }
            console.log(existingLines)
            console.log(existingUpper)
            draw();
        }
    }
    
    
}

function onmousemove(e) {
    if(!gotLower || !gotUpper){
        if (hasLoaded) {
            mouseX = e.clientX - bounds.left;
            mouseY = e.clientY - bounds.top;
            
            if (isDrawing) {
                draw();
            }
        }
    }
    
}

function process_line(x1,y1,x2,y2){
    a=(y2-y1)/(x2-x1)
    b=y1-a*x1
    console.log(a,b)
    return [a,b]
}

function get_full_line(a,b){
    //y=ax+b
    startX=0;
    startY=b;
    endX=1500;
    endY=1500*a+b;
    return {
        startX: startX,
        startY: (-1)*startY,
        endX: endX,
        endY: (-1)*endY
    }
}


function calculate_intersection(line1,line2){
    x=(line2[1]-line1[1])/(line1[0]-line2[0])
    y=line1[0]*x+line1[1]
    return [x,y]
}

function pair(){
    for(var i = 0; i < lowerConstraints.length; i=i+2){
        if(i!=lowerConstraints.length-1){
            constraint1=lowerConstraints[i]
            constraint2=lowerConstraints[i+1]
            existingPairs.push([calculate_intersection(constraint1,constraint2),constraint1,constraint2])
            // console.log("paired",constraint1,constraint2)
        }
        else{
            remainingLower.push(lowerConstraints[i])
        }
    }
};

function update(){
    ctx.fillStyle = "#333333";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (var i = 0; i < existingUpper.length; ++i) {
        var line = existingUpper[i];
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
    }
    
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = "green";
    for (var i = 0; i < existingLower.length; ++i) {
        var line = existingLower[i];
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
    }
    
    ctx.stroke();

    
    for (var i = 0; i < existingPairs.length; ++i) {
        ctx.beginPath();
        var intersection = existingPairs[i][0];
        // console.log("drawing circle at",intersection[0], -intersection[1])
        ctx.arc(intersection[0], -intersection[1], 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'blue';
        ctx.fill()
        ctx.stroke();
    }
    
}

function get_median_intersection(){
    var intersections=[]
    for (var i = 0; i < existingPairs.length; ++i) {
        intersections.push(existingPairs[i][0][0])
    }
    mid_intersection=median(intersections)
    
    for (var i = 0; i < existingPairs.length; ++i) {
        if(mid_intersection==existingPairs[i][0][0]){
            var intersection=existingPairs[i][0];
            break;
        }
    }
    console.log("intersection",intersection)
    ctx.beginPath();
    ctx.arc(intersection[0], -intersection[1], 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'yellow';
    ctx.fill()
    ctx.stroke();
    return intersection
}

function test_line(x){
    bottom_upper_constraint=[Number.MAX_VALUE,[0,0]]
    top_lower_constraint=[Number.MIN_SAFE_INTEGER,[0,0]]
    var a=null;
    var b=null;
    var constraint=[]
    for(var i = 0; i < upperConstraints.length; ++i){
        constraint=upperConstraints[i];
        a=constraint[0];
        b=constraint[1];
        if (a*x+b<bottom_upper_constraint[0]){
            bottom_upper_constraint=[a*x+b,[a,b]]
        }
        else if(a*x+b==bottom_upper_constraint[0]){
            bottom_upper_constraint.push([a,b])
        }
            
    }
    console.log("lowerC",lowerConstraints)
    for(var i = 0; i < lowerConstraints.length; ++i){
        constraint=lowerConstraints[i];
        a=constraint[0];
        b=constraint[1];
        if (a*x+b>top_lower_constraint[0]){
           
            top_lower_constraint=[a*x+b,[a,b]]
        }
        else if(a*x+b==top_lower_constraint[0]){
            top_lower_constraint.push([a,b])
        }
            
    }
    console.log("tl and bu",top_lower_constraint, bottom_upper_constraint)
    //what if top/bottom is an intersection?
    console.log("drawing test line with x = ",x)
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x,0);
    ctx.lineTo(x,1000);
    ctx.stroke()
    ctx.beginPath();
    ctx.strokeStyle = "#7FFF00";
    for(var i = 1; i < top_lower_constraint.length; ++i){
    var line = get_full_line(top_lower_constraint[i][0],top_lower_constraint[i][1]);
    ctx.moveTo(line.startX,line.startY);
    ctx.lineTo(line.endX,line.endY);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "#8A2BE2";
    for(var i = 1; i < bottom_upper_constraint.length; ++i){
    line = get_full_line(bottom_upper_constraint[i][0],bottom_upper_constraint[i][1]);
    console.log("drawing buc",line)
    ctx.moveTo(line.startX,line.startY);
    ctx.lineTo(line.endX,line.endY);
    }
    ctx.stroke();
    return top_lower_constraint, bottom_upper_constraint
}

function discard_constraints(){

}

function step(){
    console.log("in step")
    pair();
    console.log("existingPairs",existingPairs);
    update();
    mid_int=get_median_intersection()
    test_line(mid_int[0])
}

function save_constraints(){
    console.log("saving",gotUpper)
    if(!gotUpper){
        console.log(upperConstraints)
        gotUpper=true;
    }
    else if(!gotLower){
        console.log(lowerConstraints)
        gotLower=true;
    }
    else{
        alert("Already got all the constraints.")
    }
    
}





