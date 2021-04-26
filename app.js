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
var remainingLower = [];
var gotLower = false;
// upperConstraints and remainingLower contains points that define the straight lines

var existingPairs=[];
var existingUpperPairs=[]
var optimal_point=null;
var optimal_line=null;
var top_lower_constraint=null;
var bottom_upper_constraint=null;
var exist_optimal=true;
var found=false;
var pairs_at_risk=[]
var constraints_to_discard=[]
var leftover=null
var upperleftover=null

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
                    remainingLower.push(coeff)
                    existingLower.push(fullLine)
                }
                
                isDrawing = false;
            }
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
    for(var i = 0; i < remainingLower.length; i=i+2){
        if(i!=remainingLower.length-1){
            constraint1=remainingLower[i]
            constraint2=remainingLower[i+1]
            existingPairs.push([calculate_intersection(constraint1,constraint2),constraint1,constraint2])
        }
        else{
            leftover=remainingLower[i]
        }
    }
};

function pair_upper(){
    for(var i = 0; i < upperConstraints.length; i=i+2){
        if(i!=upperConstraints.length-1){
            constraint1=upperConstraints[i]
            constraint2=upperConstraints[i+1]
            existingUpperPairs.push([calculate_intersection(constraint1,constraint2),constraint1,constraint2])
        }
        else{
            upperleftover=upperConstraints[i]
        }
    }
};

function update(){
    ctx.fillStyle = "#333333";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    if(upperConstraints.length!=0){
        existingUpper.length=0
        for(var i = 0; i < upperConstraints.length; ++i){
            existingUpper.push(get_full_line(upperConstraints[i][0],upperConstraints[i][1]))
        }
    }
    ctx.beginPath();
    
    
    for (var i = 0; i < existingUpper.length; ++i) {
        var line = existingUpper[i];
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
    }
    
    ctx.stroke();
    if(remainingLower.length!=0){
        existingLower.length=0
        for(var i = 0; i < remainingLower.length; ++i){
            existingLower.push(get_full_line(remainingLower[i][0],remainingLower[i][1]))
        }
    }
    ctx.beginPath();
    ctx.strokeStyle = "green";
    for (var i = 0; i < existingLower.length; ++i) {
        var line = existingLower[i];
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
    }
    
    ctx.stroke();

    
    
    
}

function update_pair(){
    for (var i = 0; i < existingPairs.length; ++i) {
        ctx.beginPath();
        var intersection = existingPairs[i][0];
        ctx.arc(intersection[0], -intersection[1], 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'blue';
        ctx.fill()
        ctx.stroke();
    }
}

function update_upper_pair(){
    for (var i = 0; i < existingUpperPairs.length; ++i) {
        ctx.beginPath();
        var intersection = existingUpperPairs[i][0];
        ctx.arc(intersection[0], -intersection[1], 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'blue';
        ctx.fill()
        ctx.stroke();
    }
}

function update_discard(){
    ctx.beginPath();
    ctx.strokeStyle = "white";
    for (var i = 0; i < constraints_to_discard.length; ++i) {
        var line = constraints_to_discard[i];
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
    }
    
    ctx.stroke();

    for (var i = 0; i < pairs_at_risk.length; ++i) {
        ctx.beginPath();
        var intersection = pairs_at_risk[i][0];
        ctx.arc(intersection[0], -intersection[1], 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'white';
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
    ctx.beginPath();
    ctx.arc(intersection[0], -intersection[1], 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'yellow';
    ctx.fill()
    ctx.stroke();
    return intersection
}

function get_median_intersection_upper(){
    var intersections=[]
    for (var i = 0; i < existingUpperPairs.length; ++i) {
        intersections.push(existingUpperPairs[i][0][0])
    }
    mid_intersection=median(intersections)
    
    for (var i = 0; i < existingUpperPairs.length; ++i) {
        if(mid_intersection==existingUpperPairs[i][0][0]){
            var intersection=existingUpperPairs[i][0];
            break;
        }
    }
    ctx.beginPath();
    // console.log(intersection)
    ctx.arc(intersection[0], -intersection[1], 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'yellow';
    ctx.fill()
    ctx.stroke();
    return intersection
}

function test_line(x){
    document.querySelector('.prompt').innerHTML = "deploying test line";
    bottom_upper_constraint=[Number.MAX_VALUE,[0,0]]
    top_lower_constraint=[Number.MIN_SAFE_INTEGER,[0,0]]
    var a=null;
    var b=null;
    var constraint=[]
    for(var i = 0; i < upperConstraints.length; ++i){
        constraint=upperConstraints[i];
        a=constraint[0];
        b=constraint[1];
        if (Math.round(parseFloat(a*x+b))<Math.round(bottom_upper_constraint[0])){
            bottom_upper_constraint=[a*x+b,[a,b]]
        }
        else if(Math.round(parseFloat(a*x+b))==Math.round(bottom_upper_constraint[0])){
            bottom_upper_constraint.push([a,b])
        }
            
    }
    for(var i = 0; i < remainingLower.length; ++i){
        constraint=remainingLower[i];
        a=constraint[0];
        b=constraint[1];
        if (Math.round(parseFloat(a*x+b))>Math.round(top_lower_constraint[0])){
           
            top_lower_constraint=[a*x+b,[a,b]]
        }
        else if(Math.round(parseFloat(a*x+b))==Math.round(top_lower_constraint[0])){
            top_lower_constraint.push([a,b])
        }
            
    }
    
    //what if top/bottom is an intersection?
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
    ctx.moveTo(line.startX,line.startY);
    ctx.lineTo(line.endX,line.endY);
    }
    ctx.stroke();
    return [top_lower_constraint, bottom_upper_constraint]
}

function discard_left(testline){
    while(existingPairs.length>0){
        curPair=existingPairs.pop()
        if(curPair[0][0]<testline){
            pairs_at_risk.push(curPair)
            if(curPair[1][0]<curPair[2][0]){
                remainingLower.push(curPair[2]);
                constraints_to_discard.push(get_full_line(curPair[1][0],curPair[1][1]));
            }
            else{
                remainingLower.push(curPair[1]);
                constraints_to_discard.push(get_full_line(curPair[2][0],curPair[2][1]));
            }

        }
        else{
            remainingLower.push(curPair[1]);
            remainingLower.push(curPair[2]);
        }
    }
}

function discard_left_upper(testline){
    while(existingUpperPairs.length>0){
        curPair=existingUpperPairs.pop()
        if(curPair[0][0]<testline){
            pairs_at_risk.push(curPair)
            if(curPair[1][0]>curPair[2][0]){
                upperConstraints.push(curPair[2]);
                constraints_to_discard.push(get_full_line(curPair[1][0],curPair[1][1]));
            }
            else{
                upperConstraints.push(curPair[1]);
                constraints_to_discard.push(get_full_line(curPair[2][0],curPair[2][1]));
            }

        }
        else{
            upperConstraints.push(curPair[1]);
            upperConstraints.push(curPair[2]);
        }
    }
}

function discard_right(testline){
    while(existingPairs.length>0){
        curPair=existingPairs.pop()
        if(curPair[0][0]>testline){
            pairs_at_risk.push(curPair)
            if(curPair[1][0]<curPair[2][0]){
                remainingLower.push(curPair[1]);
                constraints_to_discard.push(get_full_line(curPair[2][0],curPair[2][1]));
            }
            else{
                remainingLower.push(curPair[2]);
                constraints_to_discard.push(get_full_line(curPair[1][0],curPair[1][1]));
            }

        }
        else{
            remainingLower.push(curPair[1]);
            remainingLower.push(curPair[2]);
        }
    }
}

function discard_right_upper(testline){
    while(existingUpperPairs.length>0){
        curPair=existingUpperPairs.pop()
        if(curPair[0][0]>testline){
            pairs_at_risk.push(curPair)
            if(curPair[1][0]>curPair[2][0]){
                upperConstraints.push(curPair[1]);
                constraints_to_discard.push(get_full_line(curPair[2][0],curPair[2][1]));
            }
            else{
                upperConstraints.push(curPair[2]);
                constraints_to_discard.push(get_full_line(curPair[1][0],curPair[1][1]));
            }

        }
        else{
            upperConstraints.push(curPair[1]);
            upperConstraints.push(curPair[2]);
        }
    }
}

function discard_constraints(testline,top_lower_constraint, bottom_upper_constraint){
    var tlc_y=top_lower_constraint[0]
    var buc_y=bottom_upper_constraint[0]
    //values of tlc and buc at test line
    var tlc_ab=top_lower_constraint[1]
    var buc_ab=bottom_upper_constraint[1]
    //params of tlc and buc
    if(tlc_y>=buc_y){
        if(tlc_ab[0]==buc_ab[0]){
            //tlc and buc are parallel, no optimal point can exist
            return false
        }
        else if (tlc_ab[0]>buc_ab[0]){
            //optimal point can exist on the left
            //discard half of the pairs on the right with larger a
            document.querySelector('.prompt').innerHTML = "not in feasible region, TLC'>BUC', discard on right";
            discard_right(testline)
            return true
        }
        else{
            //optimal point can exist on the right
            //discard half of the pairs on the left with smaller a
            document.querySelector('.prompt').innerHTML = "not in feasible region, TLC'>BUC', discard on left";
            discard_left(testline)
            return true
        }
    }
    else{
        //already inside feasible region
        if(top_lower_constraint.length>=3){
            //potential optimal if >=2 lower constraints intersect
            var a_smaller_than_0=false;
            var a_bigger_than_0=false;
            
            for(var i=1;i<top_lower_constraint.length;i++){
                if(top_lower_constraint[i][0]==0){
                    optimal_line=top_lower_constraint[i]
                    found=true;
                    return true;
                }
                else if(top_lower_constraint[i][0]<0){
                    a_smaller_than_0=true;
                }
                else{
                    a_bigger_than_0=true;
                }
            }
            if(a_smaller_than_0 && a_bigger_than_0){
                //intersection is local minimum, same as global minimum
                optimal_point=top_lower_constraint[0];
                ctx.beginPath();
                ctx.arc(top_lower_constraint[0][0], -top_lower_constraint[0][1], 15, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'green';
                ctx.fill()
                ctx.stroke();
                document.querySelector('.prompt').innerHTML = "Optimal point found";
                found=true;
                return true;
            }
            else{
                if(!a_smaller_than_0){
                    //all of tlc have a bigger than 0
                    //optimal on the left
                    document.querySelector('.prompt').innerHTML = "TLC'>0 and in feasible region, discard on right";
                    discard_right(testline)
                }
                else{
                    //optimal on the right
                    document.querySelector('.prompt').innerHTML = "TLC'<0 and in feasible region, discard on left";
                    discard_left(testline)
                }        
            }
        }
        else{
            if(top_lower_constraint[1][0]>0){
                //optimal point on left
                document.querySelector('.prompt').innerHTML = "TLC'>0 and in feasible region, discard on right";
                discard_right(testline)
            }
            else{
                //optimal point on right
                document.querySelector('.prompt').innerHTML = "TLC'<0 and in feasible region, discard on left";
                discard_left(testline)
            }
        }
        return true;
    }
}

function discard_upper_constraints(testline,top_lower_constraint, bottom_upper_constraint){
    var tlc_y=top_lower_constraint[0]
    var buc_y=bottom_upper_constraint[0]
    //values of tlc and buc at test line
    var tlc_ab=top_lower_constraint[1]
    var buc_ab=bottom_upper_constraint[1]
    //params of tlc and buc
    if(tlc_y>=buc_y){
        //if not in feasible region
        if(bottom_upper_constraint.length>=3){
            var a_of_bucs=[]
            for(var i=1;i<bottom_upper_constraint.length;i++){
                a_of_bucs.push(bottom_upper_constraint[i][0])
            }
            var max_of_array = Math.max.apply(Math, array);
            var min_of_array = Math.min.apply(Math, array);
            if(tlc_ab[0]>max_of_array){
                //tlc[a]>max(buc[a]), feasible region may exist on left
                document.querySelector('.prompt').innerHTML = "not feasible, tlc[a]>max(buc[a]), discard upper right";
                discard_right_upper(testline)
            }
            else if (tlc_ab[0]<min_of_array){
                //tlc[a]<min(buc[a]), feasible region may exist on right
                document.querySelector('.prompt').innerHTML = "not feasible, tlc[a]<min(buc[a]), discard upper left";
                discard_left_upper(testline)
            }
            else{
                return false
            }       
            
        }
        else{
            if (tlc_ab[0]>buc_ab[0]){
                //optimal point can exist on the left
                //discard half of the pairs on the right with larger a
                document.querySelector('.prompt').innerHTML = "not in feasible region, TLC'>BUC', discard on right";
                discard_right_upper(testline)
                return true
            }
            else{
                //optimal point can exist on the right
                //discard half of the pairs on the left with smaller a
                document.querySelector('.prompt').innerHTML = "not in feasible region, TLC'>BUC', discard on left";
                discard_left_upper(testline)
                return true
            }
        }
    }
    else{
        //already inside feasible region
        if(top_lower_constraint[1][0]>0){
            //optimal point on left
            document.querySelector('.prompt').innerHTML = "TLC'>0 and in feasible region, discard on right";
            discard_right_upper(testline)
        }
        else{
            //optimal point on right
            document.querySelector('.prompt').innerHTML = "TLC'<0 and in feasible region, discard on left";
            discard_left_upper(testline)
        }
        return true;
    }
}

function check_above_or_below(line,point){
    var a=line[0];
    var b=line[1];
    var x=point[0]
    var y=point[1]
    
    if(Math.round(parseFloat(a*x+b))>Math.round(parseFloat(y))){
        //point below line
        return false
    }
    else{
        //point above or on line
        return true
    }
}

function on_line(line,point){
    var a=line[0];
    var b=line[1];
    var x=point[0]
    var y=point[1]
    return Math.round(parseFloat(a*x+b))==Math.round(parseFloat(y))
}
function brute_force(){
    var lowest_point=[Number.MAX_VALUE]
    var intersections=[]
    for(var i=0;i<remainingLower.length;i++){
        for(var j=i+1;j<remainingLower.length;j++){
            intersections.push([calculate_intersection(remainingLower[i],remainingLower[j]),remainingLower[i],remainingLower[j]])
        }
    }

    for(var i=0;i<remainingLower.length;i++){
        // console.log(intersections)
        for(var j=0;j<upperConstraints.length;j++){
            intersections.push([calculate_intersection(remainingLower[i],upperConstraints[j]),remainingLower[i],upperConstraints[j]])
        }
        // console.log(intersections)
    }
    
    for(var i=0;i<intersections.length;i++){
        var aboveUpper=false;
        var belowLower=false;
        for(var j=0;j<upperConstraints.length;j++){
            if(!on_line(upperConstraints[j],intersections[i][0])){
                if(check_above_or_below(upperConstraints[j],intersections[i][0])){
                    aboveUpper=true;
                    break;
                }
            }
            
        }
        for(var j=0;j<remainingLower.length;j++){
            if(!on_line(remainingLower[j],intersections[i][0])){
                if(!check_above_or_below(remainingLower[j],intersections[i][0])){
                    belowLower=true;
                    break;
                }
            }
            
        }
        if(!aboveUpper && !belowLower){
            if(intersections[i][0][1]<lowest_point[0]){
                lowest_point=[intersections[i][0][1],intersections[i][0]]
            }
            else if(intersections[i][0][1]==lowest_point[0]){
                lowest_point.push(intersections[i][0])
                optimal_line=[lowest_point[1],lowest_point[2]]
                return true
            }
        }
        
    }
    if(lowest_point[0]!=Number.MAX_VALUE){
        optimal_point=lowest_point[1]
        return true
    }
    else{
        return false
    }
     
}
var counter=0;
var mid_int=null;
var result=null;

function step(){
    document.querySelector('.remainingLC_title').innerHTML = "#remaining lower constraints"
    document.querySelector('.remainingUC_title').innerHTML = "#remaining upper constraints"
    document.querySelector('.remainingLC').innerHTML = remainingLower.length;
    document.querySelector('.remainingUC').innerHTML = upperConstraints.length;
    if(remainingLower.length==0){
        document.querySelector('.prompt').innerHTML = "No lower constraints, optimal point at infinity.";
        return true
    }
    if(!found){
        if(remainingLower.length<=5 && upperConstraints.length<=5){
            if(brute_force()){
                if(optimal_point){
                    ctx.beginPath();
                    ctx.arc(optimal_point[0], -optimal_point[1], 15, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'green';
                    ctx.fill()
                    ctx.stroke();
                    document.querySelector('.prompt').innerHTML = "Optimal point found";
                }
                else{
                    ctx.beginPath();
                    ctx.arc(optimal_line[0][0], -optimal_line[0][1], 15, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'green';
                    ctx.fill()
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(optimal_line[1][0], -optimal_line[1][1], 15, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'green';
                    ctx.fill()
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.strokeStyle = "lime";
                    ctx.moveTo(optimal_line[0][0],-optimal_line[0][1]);
                    ctx.lineTo(optimal_line[1][0],-optimal_line[1][1]);
                    ctx.stroke();
                    document.querySelector('.prompt').innerHTML = "Optimal point is on a line";
                }
                found=true
            }
            else{
                document.querySelector('.prompt').innerHTML = "No feasible region";
                found=true
            }
            return true
        }
        else if(remainingLower.length>5){
            if(counter%3==0){
                update()
            }
            else if(counter%3==1){
                pair();
                update_pair();
                mid_int=get_median_intersection()
                result=test_line(mid_int[0])
                top_lower_constraint=result[0]
                bottom_upper_constraint=result[1]
            }
            else{
                remainingLower.length=0
                discard_constraints(mid_int[0],top_lower_constraint,bottom_upper_constraint)
                update_discard();
                if(leftover){
                    remainingLower.push(leftover)
                    leftover=null
                }
                constraints_to_discard.length=0
                pairs_at_risk.length=0
                document.querySelector('.remainingLC').innerHTML = remainingLower.length;
            }
        }
        else{
            if(counter%3==0){
                update()
            }
            else if(counter%3==1){
                pair_upper();
                update_upper_pair();
                mid_int=get_median_intersection_upper()
                result=test_line(mid_int[0])
                top_lower_constraint=result[0]
                bottom_upper_constraint=result[1]
            }
            else{
                upperConstraints.length=0
                discard_upper_constraints(mid_int[0],top_lower_constraint,bottom_upper_constraint)
                update_discard();
                if(upperleftover){
                    upperConstraints.push(upperleftover)
                    upperleftover=null
                }
                constraints_to_discard.length=0
                pairs_at_risk.length=0
                document.querySelector('.remainingUC').innerHTML = upperConstraints.length;
            }
        }
        
        
        
    }
    else{
        if(optimal_point || optimal_line){
            alert("already found!")
        }
        else{
            document.querySelector('.prompt').innerHTML = "No feasible region";
        }
        
    }
    counter++
}

function save_constraints(){
    if(!gotUpper){
        gotUpper=true;
        document.querySelector('.prompt').innerHTML = "Now draw the lower constraints";
    }
    else if(!gotLower){
        gotLower=true;
        document.querySelector('.prompt').innerHTML = "Press run to show steps!";
    }
    else{
        alert("Already got all the constraints.")
    }
    
}
