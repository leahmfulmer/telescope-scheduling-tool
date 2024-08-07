// Telescope Observation Constraint Visualization Tool

// SOGS stands for Science Operations Ground System,
// a FORTRAN-based software system developed for use by
// astronomers at the Space Telescope Science Institute.
// Link: https://apps.dtic.mil/sti/tr/pdf/ADA227461.pdf

// Initialize formatting
var canvaswidth = 1500;
var leftmargin = 80;
var axiswidth = canvaswidth - leftmargin;
var bottommargin = 0;
var pcfheight = 10;
var colorbarheight = 60;
var timelineheight = 18;
var tickweight = timelineheight;
var majortickperiod = 7;
var labelfont = 'Arial';
var axiscolor = 'black';

// Initialize lists
var canvasIds = [];
var origcanvasIds = [];
var timearray = [];
var timedragstart = [];
var timedragend = [];
var colorarray = [];
var transitionarray = [];

// addOverlay: Adds the overlay id of a particular PCF to an existing array of overlay ids
function addOverlay(canvas) {
    var c=document.getElementById(canvas);
    var ctx=c.getContext('2d');
    canvasIds.push(canvas);
}

// addCanvas: Adds the canvas id of a particular PCF to an existing array of canvas ids
function addCanvas(canvas) {
    var c=document.getElementById(canvas);
    var ctx=c.getContext('2d');
    origcanvasIds.push(canvas);
}

// clearCanvas: Clears a particular canvas
function clearCanvas(canvas) {
    var c=document.getElementById(canvas);
    var ctx=c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
}

// drawLine: Draws a line
function drawLine(x1, y1, x2, y2, color, canvas) {
    var c=document.getElementById(canvas);
    var ctx=c.getContext('2d');
    var maxY=c.height;
    var zx1=Math.floor(x1)+0.5;
    var zx2=Math.floor(x2)+0.5;
    var zy1=maxY-Math.floor(y1)+0.5;
    var zy2=maxY-Math.floor(y2)+0.5;
    ctx.strokeStyle=color;
    ctx.beginPath();
    ctx.moveTo(zx1,zy1);
    ctx.lineTo(zx2,zy2);
    ctx.stroke();
}

// drawFillRect: Draws a filled rectangle
function drawFillRect(x, y, width, height, color, canvas) {
    var c=document.getElementById(canvas);
    var ctx=c.getContext('2d');
    var maxY=c.clientHeight;
    var zx=Math.floor(x)+0.5;
    var zy=Math.floor(maxY-y)+0.5;
    ctx.fillStyle=color;
    ctx.fillRect(zx,zy,width,height);
}

// drawBar: Draws a bar
function drawBar(x, y, bmargin, color, canvas) {
    drawLine(x,bmargin,x,y,color,canvas);
}

// drawHLine: Draws a horizontal line
function drawHLine(x, y, color, canvas) {
    var c=document.getElementById(canvas);
    var maxX=c.width;
    drawLine(x,y,maxX,y,color,canvas);
}

// drawVLine: Draws a vertical line
function drawVLine(x, y, color, canvas) {
    var c=document.getElementById(canvas);
    var maxY=c.height;
    drawLine(x,y,x,maxY,color,canvas);
}

// drawHTick: Draws a horizontal tick
function drawHTick(x, y, length, color, canvas) {
    drawLine(x,y,x-length,y,color,canvas);
}

// drawVTick: Draws a vertical tick
function drawVTick(x, y, length, color, canvas) {
    drawLine(x,y,x,y-length,color,canvas);
}

// initPlotWidth: Sets a width attribute for a canvas
function initPlotWidth(canvas) {
    var c=document.getElementById(canvas);
    var width=c.width;
    c.setAttribute('width', width);
}

// drawText: Draws text
function drawText(text, x, y, maxwidth, font, color, canvas) {
    var c=document.getElementById(canvas);
    var ctx=c.getContext('2d');
    var maxY=c.height;
    ctx.textAlign="start";
    ctx.fillStyle=color;
    ctx.font = font;
    ctx.fillText(text,x,maxY-y,maxwidth);
}

// addIndicatorListener: Adds an event listener to a particular canvas.
// The event listener will note the cursor’s position within the window
// and return information about its position to be later reflected in
// the location of the vertical red Time Bar and the time information
// in the Time Display
function addIndicatorListener(canvas, bottommargin, leftmargin, canvaswidth, start, end) {

    // Create a  unique transition array
    var canvnospaces = canvas.replace(/\s/g, '');
    window['uniqtransarray_' + canvnospaces] = transitionarray;
    var uniqtransarray = window['uniqtransarray_' + canvnospaces];
    var uniqtransarraytjd = uniqtransarray.map(function(value,index) { return value[0]; });
    var uniqtransarraysogs = uniqtransarray.map(function(value,index) { return value[1]; });
    var uniqtransarrayabs = uniqtransarray.map(function(value,index) { return value[2]; });
    var uniqtransarrayval = uniqtransarray.map(function(value,index) { return value[3]; });

    localstart = start;
    localend = end;

    var c=document.getElementById(canvas);
    var overlayId = canvas + '-overlay';
    var o=document.getElementById(overlayId);
    var ctx=o.getContext('2d');

    window.addEventListener('resize', function(event){
	clearCanvas('Color Bar-overlay')
	clearCanvas('Bottom Timeline-overlay')
    } ,false);

    o.addEventListener('mousemove', function(event){
	var numdays = localend - localstart
	var axiswidth = canvaswidth - leftmargin
	var daypx = numdays / axiswidth

	var len = canvasIds.length;

	var x = event.offsetX;
	var clientX = event.clientX
	var scale = (document.body.clientWidth) / canvaswidth

	xscale = (x / scale) - 1
	if (xscale < leftmargin) {
	    xscale = leftmargin;
	};
	if (xscale > canvaswidth) {
	    xscale = canvaswidth;
	};

	var xtjd = (((xscale-leftmargin) * daypx) + localstart)

	for (i=0; i<len; i++) {
	    var canv = canvasIds[i];
	    clearCanvas(canv);
	    drawFillRect(xscale, timelineheight, 2, timelineheight, 'red', canv);

	    var closesttransitiontjd = uniqtransarraytjd.filter( function(i){ return i <= xtjd }).pop();

	    // Highlight Constraint Label On Mousemove
	    drawText(uniqtransarraytjd[0], 0, bottommargin, 1000, 'Arial', 'black', overlayId);
	    drawHLine(leftmargin, (bottommargin + 1), 'black', overlayId)

	};

	clearCanvas('Color Bar-overlay')
	clearCanvas('Bottom Timeline-overlay')
	drawFillRect(xscale, timelineheight, 2, timelineheight, 'red', 'Bottom Timeline-overlay');

	var uniqindex = uniqtransarraytjd.indexOf(closesttransitiontjd)

	// Draw Transition Time Range for Selected PCF Start, End in tjd, sogs, and abs-time
	drawText((Math.round(uniqtransarraytjd[uniqindex] * 10) / 10), (leftmargin + 378), (bottommargin + 17), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText((Math.round(uniqtransarraytjd[uniqindex + 1] * 10) / 10), (leftmargin + 440), (bottommargin + 17), 1000, 'Arial', 'black', 'Color Bar-overlay');

	drawText(uniqtransarraysogs[uniqindex], (leftmargin + 588), (bottommargin + 17), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(uniqtransarraysogs[uniqindex + 1], (leftmargin + 695), (bottommargin + 17), 1000, 'Arial', 'black', 'Color Bar-overlay');
	
	drawText(uniqtransarrayabs[uniqindex], (leftmargin + 897), (bottommargin + 17), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(uniqtransarrayabs[uniqindex + 1], (leftmargin + 993), (bottommargin + 17), 1000, 'Arial', 'black', 'Color Bar-overlay');

	// Draw Constraint Priority at Selected Time
	drawText(uniqtransarrayval[uniqindex], (leftmargin + 300), (bottommargin + 2), 1000, 'Arial', 'black', 'Color Bar-overlay');

	var timearraytjd = timearray.map(function(value,index) { return value[0]; });
	var xtjdstep = timearraytjd.filter( function(i){ return i <= xtjd }).pop();
	var index = timearraytjd.indexOf(xtjdstep)

	// Draw Zoomed Timeline Time Bar Position in tjd, sogs, and abs-time
	drawText(timearray[index][0], (leftmargin + 378), (bottommargin + 33), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][1], (leftmargin + 588), (bottommargin + 33), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][2], (leftmargin + 897), (bottommargin + 33), 1000, 'Arial', 'black', 'Color Bar-overlay');
	
	var thistimedragstart = localstart;
	var thistimedragend = localend;
	
	var timedragstartstep = Math.floor(thistimedragstart) + 0.5
	var timedragendstep = Math.floor(thistimedragend) + 0.5

	var startindex = timearraytjd.indexOf(timedragstartstep)
	var endindex = timearraytjd.indexOf(timedragendstep)

	// Draw Unzoomed Timeline Selected Range in tjd, sogs, and abs-time
	drawText(timearray[startindex][0], (leftmargin + 378), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[endindex][0], (leftmargin + 440), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[startindex][1], (leftmargin + 588), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[endindex][1], (leftmargin + 695), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[startindex][2], (leftmargin + 897), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[endindex][2], (leftmargin + 993), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');

    } ,false);

    // clear line
    var divId = canvas + '-div';
    if (!document.getElementById(divId)) {
	var newDiv = document.createElement('div');
	newDiv.id = divId;
	document.body.appendChild(newDiv);
    }
    var d=document.getElementById(divId);
    d.addEventListener('mousemove', function(event) {
	var len2 = canvasIds.length;
	for (i=0; i<len2; i++) {
	    var canv = canvasIds[i];
	    clearCanvas(canv);
	};
    } ,false);

}

// addTimeDrag: Adds the relevant event listeners for the Zooming
// and Unzooming Features, including dragging events (mousedown
// and mouseup) for Zooming and keypress events for Unzooming
function addTimeDrag(canvas, bottommargin, leftmargin, canvaswidth, canvasheight, globalstart, start, globalend, end, numcolors) {
    var GToverlayId = 'Global Timeline-overlay';
    var o = document.getElementById(GToverlayId);
    var ctx=o.getContext('2d');
    var numdays = globalend - globalstart
    var axiswidth = canvaswidth - leftmargin
    var daypx = numdays / axiswidth
    var startx = ((start - globalstart) * (1 / daypx)) + leftmargin
    var endx = ((end - globalstart) * (1 / daypx)) + leftmargin

    window.addEventListener('resize', function(event){
	clearCanvas('Color Bar-overlay')
    } ,false);

    o.addEventListener('mousedown', function (event) {
	var x = event.offsetX;

	var scale = (document.body.clientWidth) / canvaswidth
	
	xscale = (x / scale) - 1
	
	if (xscale < leftmargin) {
	    xscale = leftmargin;
	};
	if (xscale > canvaswidth) {
	    xscale = canvaswidth;
	};

	timedragstart.push(xscale);

	var xtjd = (((xscale-leftmargin) * daypx) + globalstart)
	
	clearCanvas(GToverlayId);
	clearCanvas('Color Bar-overlay');
	drawFillRect(xscale, timelineheight, 3, timelineheight, 'blue', GToverlayId)

	var xtjdstep = Math.floor(xtjd) + 0.5

	var timearraytjd = timearray.map(function(value,index) { return value[0]; });
	localstart = xtjdstep;
	var index = timearraytjd.indexOf(xtjdstep)

	// Draw Zoomed Start in tjd, sogs, and abs-time
	drawText(timearray[index][0], (leftmargin + 378), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][1], (leftmargin + 588), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][2], (leftmargin + 897), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
    } ,false);

    o.addEventListener('mouseup', function (event) {
	var x = event.offsetX;

	var scale = (document.body.clientWidth) / canvaswidth
	
	xscale = (x / scale) - 1
	
	if (xscale < leftmargin) {
	    xscale = leftmargin;
	};
	if (xscale > canvaswidth) {
	    xscale = canvaswidth;
	};

	timedragend.push(xscale);
	
	var xtjd = (((xscale-leftmargin) * daypx) + globalstart)
	
	if (xtjd > (end)) {
	    xtjd = end;
	};
	
	drawFillRect(xscale, timelineheight, 3, timelineheight, 'blue', GToverlayId)

	ctx.globalAlpha = 0.2;
	drawFillRect(timedragstart[timedragstart.length - 1], timelineheight, (timedragend[timedragend.length - 1] - timedragstart[timedragstart.length - 1]), timelineheight, 'blue', GToverlayId)
	ctx.globalAlpha = 1.0;

	var xtjdstep = Math.floor(xtjd) + 0.5

	var timearraytjd = timearray.map(function(value,index) { return value[0]; });
	localend = xtjdstep;
	var index = timearraytjd.indexOf(xtjdstep)

	// Draw Zoomed End in tjd, sogs, and abs-time
	drawText(timearray[index][0], (leftmargin + 440), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][1], (leftmargin + 695), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][2], (leftmargin + 993), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	
	redrawPCFData(bottommargin, leftmargin, canvaswidth, canvasheight, globalstart, start, globalend, end, numcolors)
    } ,false);

    window.addEventListener('keypress', function (event) {	
	// Do the same thing that happens in the 'mouseup' and
	// 'mousedown' events above, but set for the entire canvas.
	
	// Mousedown...
	xscale = leftmargin;

	timedragstart.push(xscale);

	var xtjd = (((xscale-leftmargin) * daypx) + globalstart)
	clearCanvas(GToverlayId);
	clearCanvas('Color Bar-overlay');

	var xtjdstep = Math.floor(xtjd) + 0.5

	var timearraytjd = timearray.map(function(value,index) { return value[0]; });
	localstart = xtjdstep;
	var index = timearraytjd.indexOf(xtjdstep)

	// Draw Unzoomed Start in tjd, sogs, and abs-time
	drawText(timearray[index][0], (leftmargin + 378), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][1], (leftmargin + 588), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][2], (leftmargin + 897), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');

	// Mouseup...
	xscale = canvaswidth;

	timedragend.push(xscale);
	
	var xtjd = (((xscale-leftmargin) * daypx) + globalstart)
	if (xtjd > globalend) {
	    xtjd = globalend;
	};

	var xtjdstep = Math.floor(xtjd) + 0.5

	var timearraytjd = timearray.map(function(value,index) { return value[0]; });
	localend = xtjdstep;
	var index = timearraytjd.indexOf(xtjdstep)

	// Draw Unzoomed End in tjd, sogs, and abs-time
	drawText(timearray[index][0], (leftmargin + 440), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][1], (leftmargin + 695), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	drawText(timearray[index][2], (leftmargin + 993), (bottommargin + 49), 1000, 'Arial', 'black', 'Color Bar-overlay');
	
	redrawPCFData(bottommargin, leftmargin, canvaswidth, canvasheight, globalstart, start, globalend, end, numcolors)

    } ,false);

    // clear line
    var divId = 'Global Timeline-div';
    if (!document.getElementById(divId)) {
	var newDiv = document.createElement('div');
	newDiv.id = divId;
	document.body.appendChild(newDiv);
    }
    var d=document.getElementById(divId);
    d.addEventListener('mousedown', function(event) {
	var len2 = canvasIds.length;
	for (i=0; i<len2; i++) {
	    var canv = canvasIds[i];
	    clearCanvas(canv);
	};
    } ,false);

}

// createTimeArray: Creates an array of days between the first
// positive input time step and the last input time step. Time
// formats include tjd, sogs-date, and abs-time. This function
// necessarily interacts with a LISP function of the same name.
function createTimeArray(i, time1, time2, time3) {
    timearray[i] = [time1, time2, time3];
    return timearray;
}

// createTransitionArray: Creates an array with all the positive
// input time steps in tjd, sogs-date, and abs- time. This function
// necessarily interacts with a LISP function of the same name.
function createTransitionArray(canvas, i, time1, time2, time3, value, firstval, lastval) {
    transitionarray[0] = [canvas, canvas, canvas, canvas];
    transitionarray[1] = [undefined, undefined, undefined, undefined];
    transitionarray[2] = [timearray[0][0], timearray[0][1], timearray[0][2], firstval];
    transitionarray[i+3] = [time1, time2, time3, value];
    transitionarray[transitionarray.length] = [timearray[timearray.length - 1], lastval];
    return transitionarray;
}

// createPCFArray: Creates an exact copy of an input PCF LISP
// structure as a JavaScript array. This function necessarily
// interacts with a LISP function of the same name.
function createPCFArray(id, i, element) {
    pcfarray[0] = [id];
    pcfarray[i+1] = [element];
    pcfarray[1] = timearray[1][0]
    pcfarray[pcfarray.length] = timearray[timearray.length - 1][0]
    return pcfarray;
}

// createColorArray: Creates an exact copy of an input color
// range LISP array as a JavaScript array. This function
// necessarily interacts with a LISP function of the same name.
function createColorArray(i, time1, time2, color, label) {
    colorarray[i] = [time1, time2, color, label];
    return colorarray;
}

// lfulmerJDUT: Recreates the built-in LISP function jdut
function lfulmerJDUT(jd) {
    var jdreference = 2444000
    var i = Math.floor(jd + 0.5 + jdreference)
    var f = (i % 1)

    if (i > 2299160) {
	var a = Math.floor((i - 1867216.25) / 36524.25)
    }

    if (i > 2299160) {
	var b = ((i + 1 + a) - Math.floor(a / 4))
    } else {
	var b = i
    }

    var c = (b + 1524)
    var d = Math.floor((c - 122.1) / 365.25)
    var e = Math.floor(d * 365.25)
    var g = Math.floor((c - e) / 30.6001)
    var day = (((c - e) + f) - Math.floor(30.6001 * g))

    if (g < 13.5) {
	var month = g - 1
    } else {
	var month = g - 13
    }

    if (month > 2.5) {
	var year = d - 4716
    } else {
	var year = d - 4715
    }

    var result = [day, month, year]
    return result
}

// lfulmerDMYtoDOY: Recreates the built-in LISP function
// day-month-year-to-day-of-year
function lfulmerDMYtoDOY(d, m, y) {

    function isLeapYear(y) {
	return ((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0);
    }

    if (isLeapYear(y) == true) {
	var leapinfo = 62
    } else {
	var leapinfo = 63
    }


    if (m <= 2) {
	var m = Math.trunc(((m - 1) * leapinfo) / 2)

    } else {
	var m = (Math.trunc((m + 1) * (153 / 5)) - leapinfo)
    }

    result = m + d
    return result
}

// lfulmerTJDtoShortSogs: Recreates the built-in LISP function
// tjd-to-short-sogs-date
function lfulmerTJDtoShortSogs(tjd) {
    function pad(num, size) {
	var s = num+'';
	while (s.length < size) s = '0' + s;
	return s;
    }

    var day = lfulmerJDUT(tjd)[0]
    var month = lfulmerJDUT(tjd)[1]
    var year = lfulmerJDUT(tjd)[2]
    var cutyear = year.toString().substr(-2)
    var paddoy = pad(lfulmerDMYtoDOY(day, month, year), 3)
    result = cutyear + '.' + paddoy
    return result

}

// drawColorBarLabels: Draws all static information within the
// Legend & Time Display
function drawColorBarLabels(id, numcolors) {

    // Draw "Legend & Time Display"
    drawText('Legend &', 0, (colorbarheight - 8), leftmargin, labelfont, axiscolor, id);
    drawText('Time Display', 0, (colorbarheight - 20), leftmargin, labelfont, axiscolor, id);

    // Draw Separator Between Legend and Time Display
    drawVLine((leftmargin + 125), bottommargin, axiscolor, id);

    // Draw First Row
    drawText('Unzoomed Timeline Selected Range:', (leftmargin + 130), (bottommargin + 50), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('Hover mouse over Constraint data to view Selected Time and Priority.', (leftmargin + 1120), (bottommargin + 50), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[tjd]:', (leftmargin + 350), (bottommargin + 50), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[sogs-date]:', (leftmargin + 520), (bottommargin + 50), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[abs-time]:', (leftmargin + 835), (bottommargin + 50), (leftmargin * 3), labelfont, axiscolor, id);

    // Draw Second Row
    drawText('Zoomed Timeline Time Bar Position:', (leftmargin + 130), (bottommargin + 34), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('Within Unzoomed Timeline, downclick to set the Zoomed Start Time,', (leftmargin + 1120), (bottommargin + 34), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[tjd]:', (leftmargin + 350), (bottommargin + 34), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[sogs-date]:', (leftmargin + 520), (bottommargin + 34), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[abs-time]:', (leftmargin + 835), (bottommargin + 34), (leftmargin * 3), labelfont, axiscolor, id);

    // Draw Third Row
    drawText('Transition Time Range for Selected PCF:', (leftmargin + 130), (bottommargin + 18), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('move the cursor, and upclick to set the Zoomed End Time.', (leftmargin + 1120), (bottommargin + 18), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[tjd]:', (leftmargin + 350), (bottommargin + 18), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[sogs-date]:', (leftmargin + 520), (bottommargin + 18), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('[abs-time]:', (leftmargin + 835), (bottommargin + 18), (leftmargin * 3), labelfont, axiscolor, id);

    // Draw Fourth Row
    drawText('Constraint Priority at Selected Time:', (leftmargin + 130), (bottommargin + 2), (leftmargin * 3), labelfont, axiscolor, id);
    drawText('Press any key to reset the visualization to Unzoomed Time.', (leftmargin + 1120), (bottommargin + 2), (leftmargin * 3), labelfont, axiscolor, id);

    for (i = 0; i < numcolors; i++) {
	// Draw Priority Color
	drawFillRect(leftmargin, (colorbarheight - ((colorbarheight / numcolors) * i)), 30, (colorbarheight / numcolors), colorarray[i][2], id);
	
	// Draw Priority Label
	drawText(colorarray[i][3], (leftmargin + 32), ((colorbarheight - ((colorbarheight / numcolors) * (i + 1))) + 1), leftmargin, labelfont, axiscolor, id);

	// Draw Priority Lower Bound 
	drawText(colorarray[i][0], (leftmargin + 83), ((colorbarheight - ((colorbarheight / numcolors) * (i + 1))) + 1), leftmargin, labelfont, axiscolor, id);

	// Draw Priority Upper Bound
	drawText(colorarray[i][1], (leftmargin + 105), ((colorbarheight - ((colorbarheight / numcolors) * (i + 1))) + 1), leftmargin, labelfont, axiscolor, id);

    };
}

// drawGlobalTimeline: Draws the Unzoomed Timeline
function drawGlobalTimeline(id, globalstart, globalend, start, end) {
    
    var numdays = globalend - globalstart;

    // Adding this in, let's see if it works.
    // This *does* make the local and global timelines align from jump,
    // but I don't know if that's exactly the execution we want...
    // var numdays = end - start;
    
    var numweeks = Math.ceil(numdays / 7);
    var pxday = axiswidth / numdays;
    var pxweek = pxday * 7;
    var tickmargin = (timelineheight - 1);
    var ticklengthlong = tickmargin;
    var ticklengthshort = 6;
    var startx = (((start - globalstart) * pxday) + leftmargin)
    var endx = (((end - globalstart) * pxday) + leftmargin)

    // Draw "Unzoomed"
    drawText('Unzoomed', 0, (timelineheight - 12), leftmargin, labelfont, axiscolor, id);
    drawHLine(leftmargin, timelineheight, axiscolor, id);

    var lastyear = '';
    var majortickspacing = pxweek * majortickperiod

    for (i = 0; i < numweeks ; i++ ) {
	var majortickp = (0 == (Math.round((i % 7) * 100) / 100))
	var x = ((i * pxweek) + leftmargin)

	// Changing "start" to "global start" as a test.
	var tjd = ((i * 7) + globalstart)
	var ssd = lfulmerTJDtoShortSogs(tjd)
	var day = ssd.substr(-3)
	var year = ssd.substr(0,2)

	if (lastyear == '' || year == lastyear) {
	    var yearchanged = false;
	}

	var date = ssd
	var lastyear = year

	if (majortickp == true) {
	    
	    // Draw Major Tick Dates in Short SOGS
	    drawText(date, (x + 1), (timelineheight - ticklengthlong), majortickspacing, labelfont, axiscolor, id)
	}

	if (majortickp == true) {
	    var ticklength = ticklengthlong
	} else {
	    var ticklength = ticklengthshort
	}

	if (yearchanged == true) {
	    var tickcolor = 'red'
	} else {
	    var tickcolor = axiscolor
	}

	drawVTick(x, timelineheight, ticklength, tickcolor, id)


    }
}

// drawLocalTimeline: Draws the Zoomed Timeline
function drawLocalTimeline(id, start, end) {
    var numdays = end - start;
    var numweeks = Math.ceil(numdays / 7);
    var pxday = axiswidth / numdays;
    var pxweek = pxday * 7;
    var tickmargin = (timelineheight - 1);
    var ticklengthlong = tickmargin;
    var ticklengthmedium = 8;
    var ticklengthshort = 4;

    // Draw "Zoomed"
    drawText('Zoomed', 0, (timelineheight - 12), leftmargin, labelfont, axiscolor, id);
    drawHLine(leftmargin, timelineheight, axiscolor, id);

    var lastyear = '';
    var majortickspacing = pxweek * majortickperiod

    for (i = 0; i < numdays ; i++ ) {
	var minortickp = (0 == (Math.round((i % 7) * 100) / 100))
	var majortickp = (0 == (Math.round((i % 49) * 100) / 100))
	var x = ((i * pxday) + leftmargin)
	var tjd = (i + start)
	var ssd = lfulmerTJDtoShortSogs(tjd)
	var day = ssd.substr(-3)
	var year = ssd.substr(0,2)

	if (lastyear == '' || year == lastyear) {
	    var yearchanged = false;
	}

	var date = ssd
	var lastyear = year

	if (majortickp == true) {
	    // Draw Major Tick Dates in Short SOGS
	    drawText(date, (x + 1), (timelineheight - ticklengthlong), majortickspacing, labelfont, axiscolor, id)
	}

	if (majortickp == true) {
	    var ticklength = ticklengthlong
	} else if (minortickp == true) {
	    var ticklength = ticklengthmedium
	} else {
	    var ticklength = ticklengthshort
	}

	if (yearchanged == true) {
	    var tickcolor = 'red'
	} else {
	    var tickcolor = axiscolor
	}

	drawVTick(x, timelineheight, ticklength, tickcolor, id)


    }
}

// drawPCFData: Draws the input PCF data
function drawPCFData(canvas, start, end, numcolors, uniqpcfarray) {
    var c=document.getElementById(canvas);
    var ctx=c.getContext('2d');

    uniqpcfarray = uniqpcfarray
    if (uniqpcfarray == 0) {
	var canvnospaces = canvas.replace(/\s/g, '');
	window['uniqpcfarray_' + canvnospaces] = pcfarray;
	var uniqpcfarray = window['uniqpcfarray_' + canvnospaces];
    };

    var numdays = end - start;
    var pxday = axiswidth / numdays;

    for (i = 1; i < (uniqpcfarray.length - 1); i += 2) {
	var day = uniqpcfarray[i]
	var nextday = uniqpcfarray[i + 2]
	var timerange = nextday - day
	var value = uniqpcfarray[i + 1]
	var y = value
	var x = (((day - start) * pxday) +  leftmargin)
	var timerangepx = timerange * pxday

	var match = false;
	for (j = 0; j < numcolors; j++) {

	    if ((colorarray[j][0] < y && y <= colorarray[j][1])) {
		match = true;
		break;
	    }
	}

	if(match) {
	    var color = colorarray[j][2];
	} else {
	    var color = 'RGB(250, 250, 250)';
	}

	drawFillRect(x, (bottommargin + tickweight), timerangepx, tickweight, color, canvas)
	ctx.clearRect(0, 0, leftmargin, pcfheight);
	
	// Draw Constraint Label
	drawText(uniqpcfarray[0], 0, bottommargin, leftmargin, labelfont, axiscolor, canvas);

    };
}

// redrawPCFData: Draws the input PCF data after a user-selected
// time period has been set or an Unzoom event has been initialized
function redrawPCFData(bottommargin, leftmargin, canvaswidth, canvasheight, globalstart, start, globalend, end, numcolors) {

    var numdays = globalend - globalstart
    var axiswidth = canvaswidth - leftmargin
    var daypx = numdays / axiswidth


    window.addEventListener('resize', function(event){
	clearCanvas('Color Bar-overlay')
    } ,false);

    thistimedragstartxscale = timedragstart[timedragstart.length - 1];
    thistimedragstart = (((thistimedragstartxscale-leftmargin) * daypx) + globalstart)

    thistimedragendxscale = timedragend[timedragend.length - 1];
    thistimedragend = (((thistimedragendxscale-leftmargin) * daypx) + globalstart)

    var origlen = origcanvasIds.length;

    clearCanvas('Top Timeline')
    clearCanvas('Bottom Timeline')
    drawLocalTimeline('Top Timeline', thistimedragstart, thistimedragend)
    drawLocalTimeline('Bottom Timeline', thistimedragstart, thistimedragend)
    
    for (k=0; k<origlen; k++) {
	var origcanv = origcanvasIds[k];
	var origcanvnospaces = origcanv.replace(/\s/g, '');
	var origcanvoverlayId = origcanv + '-overlay';
	var uniqpcfarray = window['uniqpcfarray_' + origcanvnospaces];
	
	clearCanvas(origcanv);
	drawPCFData(origcanv, thistimedragstart, thistimedragend, numcolors, uniqpcfarray)

    };
}


createColorArray(0, 0.5, 1.0, "RGB(255, 160, 122)", "Priority 1");
createColorArray(1, 0.4, 0.5, "RGB(233, 150, 122)", "Priority 2");
createColorArray(2, 0.3, 0.4, "RGB(250, 128, 114)", "Priority 3");
createColorArray(3, 0.2, 0.3, "RGB(240, 128, 128)", "Priority 4");
createColorArray(4, 0.1, 0.2, "RGB(205, 92, 92)", "Priority 5");
createColorArray(5, 0.0, 0.1, "RGB(100, 110, 92)", "Priority 6");

drawColorBarLabels("Color Bar", 6);
addOverlay("Color Bar-overlay");

createTimeArray(0, 12879.5, "2014.222:00:00:00", 1112788800000);
createTimeArray(1, 12880.5, "2014.223:00:00:00", 1112875200000);
createTimeArray(2, 12881.5, "2014.224:00:00:00", 1112961600000);
createTimeArray(3, 12882.5, "2014.225:00:00:00", 1113048000000);
createTimeArray(4, 12883.5, "2014.226:00:00:00", 1113134400000);
createTimeArray(5, 12884.5, "2014.227:00:00:00", 1113220800000);
createTimeArray(6, 12885.5, "2014.228:00:00:00", 1113307200000);
createTimeArray(7, 12886.5, "2014.229:00:00:00", 1113393600000);
createTimeArray(8, 12887.5, "2014.230:00:00:00", 1113480000000);
createTimeArray(9, 12888.5, "2014.231:00:00:00", 1113566400000);
createTimeArray(10, 12889.5, "2014.232:00:00:00", 1113652800000);
createTimeArray(11, 12890.5, "2014.233:00:00:00", 1113739200000);
createTimeArray(12, 12891.5, "2014.234:00:00:00", 1113825600000);
createTimeArray(13, 12892.5, "2014.235:00:00:00", 1113912000000);
createTimeArray(14, 12893.5, "2014.236:00:00:00", 1113998400000);
createTimeArray(15, 12894.5, "2014.237:00:00:00", 1114084800000);
createTimeArray(16, 12895.5, "2014.238:00:00:00", 1114171200000);
createTimeArray(17, 12896.5, "2014.239:00:00:00", 1114257600000);
createTimeArray(18, 12897.5, "2014.240:00:00:00", 1114344000000);
createTimeArray(19, 12898.5, "2014.241:00:00:00", 1114430400000);
createTimeArray(20, 12899.5, "2014.242:00:00:00", 1114516800000);
createTimeArray(21, 12900.5, "2014.243:00:00:00", 1114603200000);
createTimeArray(22, 12901.5, "2014.244:00:00:00", 1114689600000);
createTimeArray(23, 12902.5, "2014.245:00:00:00", 1114776000000);
createTimeArray(24, 12903.5, "2014.246:00:00:00", 1114862400000);
createTimeArray(25, 12904.5, "2014.247:00:00:00", 1114948800000);
createTimeArray(26, 12905.5, "2014.248:00:00:00", 1115035200000);
createTimeArray(27, 12906.5, "2014.249:00:00:00", 1115121600000);
createTimeArray(28, 12907.5, "2014.250:00:00:00", 1115208000000);
createTimeArray(29, 12908.5, "2014.251:00:00:00", 1115294400000);
createTimeArray(30, 12909.5, "2014.252:00:00:00", 1115380800000);
createTimeArray(31, 12910.5, "2014.253:00:00:00", 1115467200000);
createTimeArray(32, 12911.5, "2014.254:00:00:00", 1115553600000);
createTimeArray(33, 12912.5, "2014.255:00:00:00", 1115640000000);
createTimeArray(34, 12913.5, "2014.256:00:00:00", 1115726400000);
createTimeArray(35, 12914.5, "2014.257:00:00:00", 1115812800000);
createTimeArray(36, 12915.5, "2014.258:00:00:00", 1115899200000);
createTimeArray(37, 12916.5, "2014.259:00:00:00", 1115985600000);
createTimeArray(38, 12917.5, "2014.260:00:00:00", 1116072000000);
createTimeArray(39, 12918.5, "2014.261:00:00:00", 1116158400000);
createTimeArray(40, 12919.5, "2014.262:00:00:00", 1116244800000);
createTimeArray(41, 12920.5, "2014.263:00:00:00", 1116331200000);
createTimeArray(42, 12921.5, "2014.264:00:00:00", 1116417600000);
createTimeArray(43, 12922.5, "2014.265:00:00:00", 1116504000000);
createTimeArray(44, 12923.5, "2014.266:00:00:00", 1116590400000);
createTimeArray(45, 12924.5, "2014.267:00:00:00", 1116676800000);
createTimeArray(46, 12925.5, "2014.268:00:00:00", 1116763200000);
createTimeArray(47, 12926.5, "2014.269:00:00:00", 1116849600000);
createTimeArray(48, 12927.5, "2014.270:00:00:00", 1116936000000);
createTimeArray(49, 12928.5, "2014.271:00:00:00", 1117022400000);
createTimeArray(50, 12929.5, "2014.272:00:00:00", 1117108800000);
createTimeArray(51, 12930.5, "2014.273:00:00:00", 1117195200000);
createTimeArray(52, 12931.5, "2014.274:00:00:00", 1117281600000);
createTimeArray(53, 12932.5, "2014.275:00:00:00", 1117368000000);
createTimeArray(54, 12933.5, "2014.276:00:00:00", 1117454400000);
createTimeArray(55, 12934.5, "2014.277:00:00:00", 1117540800000);
createTimeArray(56, 12935.5, "2014.278:00:00:00", 1117627200000);
createTimeArray(57, 12936.5, "2014.279:00:00:00", 1117713600000);
createTimeArray(58, 12937.5, "2014.280:00:00:00", 1117800000000);
createTimeArray(59, 12938.5, "2014.281:00:00:00", 1117886400000);
createTimeArray(60, 12939.5, "2014.282:00:00:00", 1117972800000);
createTimeArray(61, 12940.5, "2014.283:00:00:00", 1118059200000);
createTimeArray(62, 12941.5, "2014.284:00:00:00", 1118145600000);
createTimeArray(63, 12942.5, "2014.285:00:00:00", 1118232000000);
createTimeArray(64, 12943.5, "2014.286:00:00:00", 1118318400000);
createTimeArray(65, 12944.5, "2014.287:00:00:00", 1118404800000);
createTimeArray(66, 12945.5, "2014.288:00:00:00", 1118491200000);
createTimeArray(67, 12946.5, "2014.289:00:00:00", 1118577600000);
createTimeArray(68, 12947.5, "2014.290:00:00:00", 1118664000000);
createTimeArray(69, 12948.5, "2014.291:00:00:00", 1118750400000);
createTimeArray(70, 12949.5, "2014.292:00:00:00", 1118836800000);
createTimeArray(71, 12950.5, "2014.293:00:00:00", 1118923200000);
createTimeArray(72, 12951.5, "2014.294:00:00:00", 1119009600000);
createTimeArray(73, 12952.5, "2014.295:00:00:00", 1119096000000);
createTimeArray(74, 12953.5, "2014.296:00:00:00", 1119182400000);
createTimeArray(75, 12954.5, "2014.297:00:00:00", 1119268800000);
createTimeArray(76, 12955.5, "2014.298:00:00:00", 1119355200000);
createTimeArray(77, 12956.5, "2014.299:00:00:00", 1119441600000);
createTimeArray(78, 12957.5, "2014.300:00:00:00", 1119528000000);
createTimeArray(79, 12958.5, "2014.301:00:00:00", 1119614400000);
createTimeArray(80, 12959.5, "2014.302:00:00:00", 1119700800000);
createTimeArray(81, 12960.5, "2014.303:00:00:00", 1119787200000);
createTimeArray(82, 12961.5, "2014.304:00:00:00", 1119873600000);
createTimeArray(83, 12962.5, "2014.305:00:00:00", 1119960000000);
createTimeArray(84, 12963.5, "2014.306:00:00:00", 1120046400000);
createTimeArray(85, 12964.5, "2014.307:00:00:00", 1120132800000);
createTimeArray(86, 12965.5, "2014.308:00:00:00", 1120219200000);
createTimeArray(87, 12966.5, "2014.309:00:00:00", 1120305600000);
createTimeArray(88, 12967.5, "2014.310:00:00:00", 1120392000000);
createTimeArray(89, 12968.5, "2014.311:00:00:00", 1120478400000);
createTimeArray(90, 12969.5, "2014.312:00:00:00", 1120564800000);
createTimeArray(91, 12970.5, "2014.313:00:00:00", 1120651200000);
createTimeArray(92, 12971.5, "2014.314:00:00:00", 1120737600000);
createTimeArray(93, 12972.5, "2014.315:00:00:00", 1120824000000);
createTimeArray(94, 12973.5, "2014.316:00:00:00", 1120910400000);
createTimeArray(95, 12974.5, "2014.317:00:00:00", 1120996800000);
createTimeArray(96, 12975.5, "2014.318:00:00:00", 1121083200000);
createTimeArray(97, 12976.5, "2014.319:00:00:00", 1121169600000);
createTimeArray(98, 12977.5, "2014.320:00:00:00", 1121256000000);
createTimeArray(99, 12978.5, "2014.321:00:00:00", 1121342400000);
createTimeArray(100, 12979.5, "2014.322:00:00:00", 1121428800000);
createTimeArray(101, 12980.5, "2014.323:00:00:00", 1121515200000);
createTimeArray(102, 12981.5, "2014.324:00:00:00", 1121601600000);
createTimeArray(103, 12982.5, "2014.325:00:00:00", 1121688000000);
createTimeArray(104, 12983.5, "2014.326:00:00:00", 1121774400000);
createTimeArray(105, 12984.5, "2014.327:00:00:00", 1121860800000);
createTimeArray(106, 12985.5, "2014.328:00:00:00", 1121947200000);
createTimeArray(107, 12986.5, "2014.329:00:00:00", 1122033600000);
createTimeArray(108, 12987.5, "2014.330:00:00:00", 1122120000000);
createTimeArray(109, 12988.5, "2014.331:00:00:00", 1122206400000);
createTimeArray(110, 12989.5, "2014.332:00:00:00", 1122292800000);
createTimeArray(111, 12990.5, "2014.333:00:00:00", 1122379200000);
createTimeArray(112, 12991.5, "2014.334:00:00:00", 1122465600000);
createTimeArray(113, 12992.5, "2014.335:00:00:00", 1122552000000);
createTimeArray(114, 12993.5, "2014.336:00:00:00", 1122638400000);
createTimeArray(115, 12994.5, "2014.337:00:00:00", 1122724800000);
createTimeArray(116, 12995.5, "2014.338:00:00:00", 1122811200000);
createTimeArray(117, 12996.5, "2014.339:00:00:00", 1122897600000);
createTimeArray(118, 12997.5, "2014.340:00:00:00", 1122984000000);
createTimeArray(119, 12998.5, "2014.341:00:00:00", 1123070400000);
createTimeArray(120, 12999.5, "2014.342:00:00:00", 1123156800000);
createTimeArray(121, 13000.5, "2014.343:00:00:00", 1123243200000);
createTimeArray(122, 13001.5, "2014.344:00:00:00", 1123329600000);
createTimeArray(123, 13002.5, "2014.345:00:00:00", 1123416000000);
createTimeArray(124, 13003.5, "2014.346:00:00:00", 1123502400000);
createTimeArray(125, 13004.5, "2014.347:00:00:00", 1123588800000);
createTimeArray(126, 13005.5, "2014.348:00:00:00", 1123675200000);
createTimeArray(127, 13006.5, "2014.349:00:00:00", 1123761600000);
createTimeArray(128, 13007.5, "2014.350:00:00:00", 1123848000000);
createTimeArray(129, 13008.5, "2014.351:00:00:00", 1123934400000);
createTimeArray(130, 13009.5, "2014.352:00:00:00", 1124020800000);
createTimeArray(131, 13010.5, "2014.353:00:00:00", 1124107200000);
createTimeArray(132, 13011.5, "2014.354:00:00:00", 1124193600000);
createTimeArray(133, 13012.5, "2014.355:00:00:00", 1124280000000);
createTimeArray(134, 13013.5, "2014.356:00:00:00", 1124366400000);
createTimeArray(135, 13014.5, "2014.357:00:00:00", 1124452800000);
createTimeArray(136, 13015.5, "2014.358:00:00:00", 1124539200000);
createTimeArray(137, 13016.5, "2014.359:00:00:00", 1124625600000);
createTimeArray(138, 13017.5, "2014.360:00:00:00", 1124712000000);
createTimeArray(139, 13018.5, "2014.361:00:00:00", 1124798400000);
createTimeArray(140, 13019.5, "2014.362:00:00:00", 1124884800000);
createTimeArray(141, 13020.5, "2014.363:00:00:00", 1124971200000);
createTimeArray(142, 13021.5, "2014.364:00:00:00", 1125057600000);
createTimeArray(143, 13022.5, "2014.365:00:00:00", 1125144000000);
createTimeArray(144, 13023.5, "2015.001:00:00:00", 1125230400000);
createTimeArray(145, 13024.5, "2015.002:00:00:00", 1125316800000);
createTimeArray(146, 13025.5, "2015.003:00:00:00", 1125403200000);
createTimeArray(147, 13026.5, "2015.004:00:00:00", 1125489600000);
createTimeArray(148, 13027.5, "2015.005:00:00:00", 1125576000000);
createTimeArray(149, 13028.5, "2015.006:00:00:00", 1125662400000);
createTimeArray(150, 13029.5, "2015.007:00:00:00", 1125748800000);
createTimeArray(151, 13030.5, "2015.008:00:00:00", 1125835200000);
createTimeArray(152, 13031.5, "2015.009:00:00:00", 1125921600000);
createTimeArray(153, 13032.5, "2015.010:00:00:00", 1126008000000);
createTimeArray(154, 13033.5, "2015.011:00:00:00", 1126094400000);
createTimeArray(155, 13034.5, "2015.012:00:00:00", 1126180800000);
createTimeArray(156, 13035.5, "2015.013:00:00:00", 1126267200000);
createTimeArray(157, 13036.5, "2015.014:00:00:00", 1126353600000);
createTimeArray(158, 13037.5, "2015.015:00:00:00", 1126440000000);
createTimeArray(159, 13038.5, "2015.016:00:00:00", 1126526400000);
createTimeArray(160, 13039.5, "2015.017:00:00:00", 1126612800000);
createTimeArray(161, 13040.5, "2015.018:00:00:00", 1126699200000);
createTimeArray(162, 13041.5, "2015.019:00:00:00", 1126785600000);
createTimeArray(163, 13042.5, "2015.020:00:00:00", 1126872000000);
createTimeArray(164, 13043.5, "2015.021:00:00:00", 1126958400000);
createTimeArray(165, 13044.5, "2015.022:00:00:00", 1127044800000);
createTimeArray(166, 13045.5, "2015.023:00:00:00", 1127131200000);
createTimeArray(167, 13046.5, "2015.024:00:00:00", 1127217600000);
createTimeArray(168, 13047.5, "2015.025:00:00:00", 1127304000000);
createTimeArray(169, 13048.5, "2015.026:00:00:00", 1127390400000);
createTimeArray(170, 13049.5, "2015.027:00:00:00", 1127476800000);
createTimeArray(171, 13050.5, "2015.028:00:00:00", 1127563200000);
createTimeArray(172, 13051.5, "2015.029:00:00:00", 1127649600000);
createTimeArray(173, 13052.5, "2015.030:00:00:00", 1127736000000);
createTimeArray(174, 13053.5, "2015.031:00:00:00", 1127822400000);
createTimeArray(175, 13054.5, "2015.032:00:00:00", 1127908800000);
createTimeArray(176, 13055.5, "2015.033:00:00:00", 1127995200000);
createTimeArray(177, 13056.5, "2015.034:00:00:00", 1128081600000);
createTimeArray(178, 13057.5, "2015.035:00:00:00", 1128168000000);
createTimeArray(179, 13058.5, "2015.036:00:00:00", 1128254400000);
createTimeArray(180, 13059.5, "2015.037:00:00:00", 1128340800000);
createTimeArray(181, 13060.5, "2015.038:00:00:00", 1128427200000);
createTimeArray(182, 13061.5, "2015.039:00:00:00", 1128513600000);
createTimeArray(183, 13062.5, "2015.040:00:00:00", 1128600000000);
createTimeArray(184, 13063.5, "2015.041:00:00:00", 1128686400000);
createTimeArray(185, 13064.5, "2015.042:00:00:00", 1128772800000);
createTimeArray(186, 13065.5, "2015.043:00:00:00", 1128859200000);
createTimeArray(187, 13066.5, "2015.044:00:00:00", 1128945600000);
createTimeArray(188, 13067.5, "2015.045:00:00:00", 1129032000000);
createTimeArray(189, 13068.5, "2015.046:00:00:00", 1129118400000);
createTimeArray(190, 13069.5, "2015.047:00:00:00", 1129204800000);
createTimeArray(191, 13070.5, "2015.048:00:00:00", 1129291200000);
createTimeArray(192, 13071.5, "2015.049:00:00:00", 1129377600000);
createTimeArray(193, 13072.5, "2015.050:00:00:00", 1129464000000);
createTimeArray(194, 13073.5, "2015.051:00:00:00", 1129550400000);
createTimeArray(195, 13074.5, "2015.052:00:00:00", 1129636800000);
createTimeArray(196, 13075.5, "2015.053:00:00:00", 1129723200000);
createTimeArray(197, 13076.5, "2015.054:00:00:00", 1129809600000);
createTimeArray(198, 13077.5, "2015.055:00:00:00", 1129896000000);
createTimeArray(199, 13078.5, "2015.056:00:00:00", 1129982400000);
createTimeArray(200, 13079.5, "2015.057:00:00:00", 1130068800000);
createTimeArray(201, 13080.5, "2015.058:00:00:00", 1130155200000);
createTimeArray(202, 13081.5, "2015.059:00:00:00", 1130241600000);
createTimeArray(203, 13082.5, "2015.060:00:00:00", 1130328000000);
createTimeArray(204, 13083.5, "2015.061:00:00:00", 1130414400000);
createTimeArray(205, 13084.5, "2015.062:00:00:00", 1130500800000);
createTimeArray(206, 13085.5, "2015.063:00:00:00", 1130587200000);
createTimeArray(207, 13086.5, "2015.064:00:00:00", 1130673600000);
createTimeArray(208, 13087.5, "2015.065:00:00:00", 1130760000000);
createTimeArray(209, 13088.5, "2015.066:00:00:00", 1130846400000);
createTimeArray(210, 13089.5, "2015.067:00:00:00", 1130932800000);
createTimeArray(211, 13090.5, "2015.068:00:00:00", 1131019200000);
createTimeArray(212, 13091.5, "2015.069:00:00:00", 1131105600000);
createTimeArray(213, 13092.5, "2015.070:00:00:00", 1131192000000);
createTimeArray(214, 13093.5, "2015.071:00:00:00", 1131278400000);
createTimeArray(215, 13094.5, "2015.072:00:00:00", 1131364800000);
createTimeArray(216, 13095.5, "2015.073:00:00:00", 1131451200000);
createTimeArray(217, 13096.5, "2015.074:00:00:00", 1131537600000);
createTimeArray(218, 13097.5, "2015.075:00:00:00", 1131624000000);
createTimeArray(219, 13098.5, "2015.076:00:00:00", 1131710400000);
createTimeArray(220, 13099.5, "2015.077:00:00:00", 1131796800000);
createTimeArray(221, 13100.5, "2015.078:00:00:00", 1131883200000);
createTimeArray(222, 13101.5, "2015.079:00:00:00", 1131969600000);
createTimeArray(223, 13102.5, "2015.080:00:00:00", 1132056000000);
createTimeArray(224, 13103.5, "2015.081:00:00:00", 1132142400000);
createTimeArray(225, 13104.5, "2015.082:00:00:00", 1132228800000);
createTimeArray(226, 13105.5, "2015.083:00:00:00", 1132315200000);
createTimeArray(227, 13106.5, "2015.084:00:00:00", 1132401600000);
createTimeArray(228, 13107.5, "2015.085:00:00:00", 1132488000000);
createTimeArray(229, 13108.5, "2015.086:00:00:00", 1132574400000);
createTimeArray(230, 13109.5, "2015.087:00:00:00", 1132660800000);
createTimeArray(231, 13110.5, "2015.088:00:00:00", 1132747200000);
createTimeArray(232, 13111.5, "2015.089:00:00:00", 1132833600000);
createTimeArray(233, 13112.5, "2015.090:00:00:00", 1132920000000);
createTimeArray(234, 13113.5, "2015.091:00:00:00", 1133006400000);
createTimeArray(235, 13114.5, "2015.092:00:00:00", 1133092800000);
createTimeArray(236, 13115.5, "2015.093:00:00:00", 1133179200000);
createTimeArray(237, 13116.5, "2015.094:00:00:00", 1133265600000);
createTimeArray(238, 13117.5, "2015.095:00:00:00", 1133352000000);
createTimeArray(239, 13118.5, "2015.096:00:00:00", 1133438400000);
createTimeArray(240, 13119.5, "2015.097:00:00:00", 1133524800000);
createTimeArray(241, 13120.5, "2015.098:00:00:00", 1133611200000);
createTimeArray(242, 13121.5, "2015.099:00:00:00", 1133697600000);
createTimeArray(243, 13122.5, "2015.100:00:00:00", 1133784000000);
createTimeArray(244, 13123.5, "2015.101:00:00:00", 1133870400000);
createTimeArray(245, 13124.5, "2015.102:00:00:00", 1133956800000);
createTimeArray(246, 13125.5, "2015.103:00:00:00", 1134043200000);
createTimeArray(247, 13126.5, "2015.104:00:00:00", 1134129600000);
createTimeArray(248, 13127.5, "2015.105:00:00:00", 1134216000000);
createTimeArray(249, 13128.5, "2015.106:00:00:00", 1134302400000);
createTimeArray(250, 13129.5, "2015.107:00:00:00", 1134388800000);
createTimeArray(251, 13130.5, "2015.108:00:00:00", 1134475200000);
createTimeArray(252, 13131.5, "2015.109:00:00:00", 1134561600000);
createTimeArray(253, 13132.5, "2015.110:00:00:00", 1134648000000);
createTimeArray(254, 13133.5, "2015.111:00:00:00", 1134734400000);
createTimeArray(255, 13134.5, "2015.112:00:00:00", 1134820800000);
createTimeArray(256, 13135.5, "2015.113:00:00:00", 1134907200000);
createTimeArray(257, 13136.5, "2015.114:00:00:00", 1134993600000);
createTimeArray(258, 13137.5, "2015.115:00:00:00", 1135080000000);
createTimeArray(259, 13138.5, "2015.116:00:00:00", 1135166400000);
createTimeArray(260, 13139.5, "2015.117:00:00:00", 1135252800000);
createTimeArray(261, 13140.5, "2015.118:00:00:00", 1135339200000);
createTimeArray(262, 13141.5, "2015.119:00:00:00", 1135425600000);
createTimeArray(263, 13142.5, "2015.120:00:00:00", 1135512000000);
createTimeArray(264, 13143.5, "2015.121:00:00:00", 1135598400000);
createTimeArray(265, 13144.5, "2015.122:00:00:00", 1135684800000);
createTimeArray(266, 13145.5, "2015.123:00:00:00", 1135771200000);
createTimeArray(267, 13146.5, "2015.124:00:00:00", 1135857600000);
createTimeArray(268, 13147.5, "2015.125:00:00:00", 1135944000000);
createTimeArray(269, 13148.5, "2015.126:00:00:00", 1136030400000);
createTimeArray(270, 13149.5, "2015.127:00:00:00", 1136116800000);
createTimeArray(271, 13150.5, "2015.128:00:00:00", 1136203200000);
createTimeArray(272, 13151.5, "2015.129:00:00:00", 1136289600000);
createTimeArray(273, 13152.5, "2015.130:00:00:00", 1136376000000);
createTimeArray(274, 13153.5, "2015.131:00:00:00", 1136462400000);
createTimeArray(275, 13154.5, "2015.132:00:00:00", 1136548800000);
createTimeArray(276, 13155.5, "2015.133:00:00:00", 1136635200000);
createTimeArray(277, 13156.5, "2015.134:00:00:00", 1136721600000);
createTimeArray(278, 13157.5, "2015.135:00:00:00", 1136808000000);
createTimeArray(279, 13158.5, "2015.136:00:00:00", 1136894400000);
createTimeArray(280, 13159.5, "2015.137:00:00:00", 1136980800000);
createTimeArray(281, 13160.5, "2015.138:00:00:00", 1137067200000);
createTimeArray(282, 13161.5, "2015.139:00:00:00", 1137153600000);
createTimeArray(283, 13162.5, "2015.140:00:00:00", 1137240000000);
createTimeArray(284, 13163.5, "2015.141:00:00:00", 1137326400000);
createTimeArray(285, 13164.5, "2015.142:00:00:00", 1137412800000);
createTimeArray(286, 13165.5, "2015.143:00:00:00", 1137499200000);
createTimeArray(287, 13166.5, "2015.144:00:00:00", 1137585600000);
createTimeArray(288, 13167.5, "2015.145:00:00:00", 1137672000000);
createTimeArray(289, 13168.5, "2015.146:00:00:00", 1137758400000);
createTimeArray(290, 13169.5, "2015.147:00:00:00", 1137844800000);
createTimeArray(291, 13170.5, "2015.148:00:00:00", 1137931200000);
createTimeArray(292, 13171.5, "2015.149:00:00:00", 1138017600000);
createTimeArray(293, 13172.5, "2015.150:00:00:00", 1138104000000);
createTimeArray(294, 13173.5, "2015.151:00:00:00", 1138190400000);
createTimeArray(295, 13174.5, "2015.152:00:00:00", 1138276800000);
createTimeArray(296, 13175.5, "2015.153:00:00:00", 1138363200000);
createTimeArray(297, 13176.5, "2015.154:00:00:00", 1138449600000);
createTimeArray(298, 13177.5, "2015.155:00:00:00", 1138536000000);
createTimeArray(299, 13178.5, "2015.156:00:00:00", 1138622400000);
createTimeArray(300, 13179.5, "2015.157:00:00:00", 1138708800000);
createTimeArray(301, 13180.5, "2015.158:00:00:00", 1138795200000);
createTimeArray(302, 13181.5, "2015.159:00:00:00", 1138881600000);
createTimeArray(303, 13182.5, "2015.160:00:00:00", 1138968000000);
createTimeArray(304, 13183.5, "2015.161:00:00:00", 1139054400000);
createTimeArray(305, 13184.5, "2015.162:00:00:00", 1139140800000);
createTimeArray(306, 13185.5, "2015.163:00:00:00", 1139227200000);
createTimeArray(307, 13186.5, "2015.164:00:00:00", 1139313600000);
createTimeArray(308, 13187.5, "2015.165:00:00:00", 1139400000000);
createTimeArray(309, 13188.5, "2015.166:00:00:00", 1139486400000);
createTimeArray(310, 13189.5, "2015.167:00:00:00", 1139572800000);
createTimeArray(311, 13190.5, "2015.168:00:00:00", 1139659200000);
createTimeArray(312, 13191.5, "2015.169:00:00:00", 1139745600000);
createTimeArray(313, 13192.5, "2015.170:00:00:00", 1139832000000);
createTimeArray(314, 13193.5, "2015.171:00:00:00", 1139918400000);
createTimeArray(315, 13194.5, "2015.172:00:00:00", 1140004800000);
createTimeArray(316, 13195.5, "2015.173:00:00:00", 1140091200000);
createTimeArray(317, 13196.5, "2015.174:00:00:00", 1140177600000);
createTimeArray(318, 13197.5, "2015.175:00:00:00", 1140264000000);
createTimeArray(319, 13198.5, "2015.176:00:00:00", 1140350400000);
createTimeArray(320, 13199.5, "2015.177:00:00:00", 1140436800000);
createTimeArray(321, 13200.5, "2015.178:00:00:00", 1140523200000);
createTimeArray(322, 13201.5, "2015.179:00:00:00", 1140609600000);
createTimeArray(323, 13202.5, "2015.180:00:00:00", 1140696000000);
createTimeArray(324, 13203.5, "2015.181:00:00:00", 1140782400000);
createTimeArray(325, 13204.5, "2015.182:00:00:00", 1140868800000);
createTimeArray(326, 13205.5, "2015.183:00:00:00", 1140955200000);
createTimeArray(327, 13206.5, "2015.184:00:00:00", 1141041600000);
createTimeArray(328, 13207.5, "2015.185:00:00:00", 1141128000000);
createTimeArray(329, 13208.5, "2015.186:00:00:00", 1141214400000);
createTimeArray(330, 13209.5, "2015.187:00:00:00", 1141300800000);
createTimeArray(331, 13210.5, "2015.188:00:00:00", 1141387200000);
createTimeArray(332, 13211.5, "2015.189:00:00:00", 1141473600000);
createTimeArray(333, 13212.5, "2015.190:00:00:00", 1141560000000);
createTimeArray(334, 13213.5, "2015.191:00:00:00", 1141646400000);
createTimeArray(335, 13214.5, "2015.192:00:00:00", 1141732800000);
createTimeArray(336, 13215.5, "2015.193:00:00:00", 1141819200000);
createTimeArray(337, 13216.5, "2015.194:00:00:00", 1141905600000);
createTimeArray(338, 13217.5, "2015.195:00:00:00", 1141992000000);
createTimeArray(339, 13218.5, "2015.196:00:00:00", 1142078400000);
createTimeArray(340, 13219.5, "2015.197:00:00:00", 1142164800000);
createTimeArray(341, 13220.5, "2015.198:00:00:00", 1142251200000);
createTimeArray(342, 13221.5, "2015.199:00:00:00", 1142337600000);
createTimeArray(343, 13222.5, "2015.200:00:00:00", 1142424000000);
createTimeArray(344, 13223.5, "2015.201:00:00:00", 1142510400000);
createTimeArray(345, 13224.5, "2015.202:00:00:00", 1142596800000);
createTimeArray(346, 13225.5, "2015.203:00:00:00", 1142683200000);
createTimeArray(347, 13226.5, "2015.204:00:00:00", 1142769600000);
createTimeArray(348, 13227.5, "2015.205:00:00:00", 1142856000000);
createTimeArray(349, 13228.5, "2015.206:00:00:00", 1142942400000);
createTimeArray(350, 13229.5, "2015.207:00:00:00", 1143028800000);
createTimeArray(351, 13230.5, "2015.208:00:00:00", 1143115200000);
createTimeArray(352, 13231.5, "2015.209:00:00:00", 1143201600000);
createTimeArray(353, 13232.5, "2015.210:00:00:00", 1143288000000);
createTimeArray(354, 13233.5, "2015.211:00:00:00", 1143374400000);
createTimeArray(355, 13234.5, "2015.212:00:00:00", 1143460800000);
createTimeArray(356, 13235.5, "2015.213:00:00:00", 1143547200000);
createTimeArray(357, 13236.5, "2015.214:00:00:00", 1143633600000);
createTimeArray(358, 13237.5, "2015.215:00:00:00", 1143720000000);
createTimeArray(359, 13238.5, "2015.216:00:00:00", 1143806400000);
createTimeArray(360, 13239.5, "2015.217:00:00:00", 1143892800000);
createTimeArray(361, 13240.5, "2015.218:00:00:00", 1143979200000);
createTimeArray(362, 13241.5, "2015.219:00:00:00", 1144065600000);
createTimeArray(363, 13242.5, "2015.220:00:00:00", 1144152000000);
createTimeArray(364, 13243.5, "2015.221:00:00:00", 1144238400000);
createTimeArray(365, 13244.5, "2015.222:00:00:00", 1144324800000);
createTimeArray(366, 13245.5, "2015.223:00:00:00", 1144411200000);
createTimeArray(367, 13246.5, "2015.224:00:00:00", 1144497600000);
createTimeArray(368, 13247.5, "2015.225:00:00:00", 1144584000000);
createTimeArray(369, 13248.5, "2015.226:00:00:00", 1144670400000);
createTimeArray(370, 13249.5, "2015.227:00:00:00", 1144756800000);
createTimeArray(371, 13250.5, "2015.228:00:00:00", 1144843200000);
createTimeArray(372, 13251.5, "2015.229:00:00:00", 1144929600000);
createTimeArray(373, 13252.5, "2015.230:00:00:00", 1145016000000);
createTimeArray(374, 13253.5, "2015.231:00:00:00", 1145102400000);
createTimeArray(375, 13254.5, "2015.232:00:00:00", 1145188800000);
createTimeArray(376, 13255.5, "2015.233:00:00:00", 1145275200000);
createTimeArray(377, 13256.5, "2015.234:00:00:00", 1145361600000);
createTimeArray(378, 13257.5, "2015.235:00:00:00", 1145448000000);
createTimeArray(379, 13258.5, "2015.236:00:00:00", 1145534400000);
createTimeArray(380, 13259.5, "2015.237:00:00:00", 1145620800000);
createTimeArray(381, 13260.5, "2015.238:00:00:00", 1145707200000);
createTimeArray(382, 13261.5, "2015.239:00:00:00", 1145793600000);
createTimeArray(383, 13262.5, "2015.240:00:00:00", 1145880000000);
createTimeArray(384, 13263.5, "2015.241:00:00:00", 1145966400000);
createTimeArray(385, 13264.5, "2015.242:00:00:00", 1146052800000);
createTimeArray(386, 13265.5, "2015.243:00:00:00", 1146139200000);
createTimeArray(387, 13266.5, "2015.244:00:00:00", 1146225600000);

drawGlobalTimeline("Global Timeline", 12879.5, 13266.5, 12880.5, 13265.5);
// Leaving this out for now because it's acting weird (e.g., listening to the Global Timeline)
// addIndicatorListener("Global Timeline", 0, 80, 1500, 12879.5, 13266.5);
addTimeDrag("Global Timeline", 0, 80, 1500, 10, 12879.5, 12880.5, 13266.5, 13265.5, 6);

// Changing start and end to globalstart and globalend
drawLocalTimeline("Top Timeline", 12879.5, 13266.5);
addOverlay("Top Timeline-overlay");
// addIndicatorListener("Top Timeline", 0, 80, 1500, 12880.5, 13265.5);


// CONSTRAINT 1
var pcfarray = [];
createPCFArray("Constraint 1", 0, -66666666666666);
createPCFArray("Constraint 1", 1, 0.0);
createPCFArray("Constraint 1", 2, 12915.5);
createPCFArray("Constraint 1", 3, 0.10286);
createPCFArray("Constraint 1", 4, 12916.5);
createPCFArray("Constraint 1", 5, 0.0);
createPCFArray("Constraint 1", 6, 12917.5);
createPCFArray("Constraint 1", 7, 0.04286);
createPCFArray("Constraint 1", 8, 12918.5);
createPCFArray("Constraint 1", 9, 0.1703);
createPCFArray("Constraint 1", 10, 12919.5);
createPCFArray("Constraint 1", 11, 0.21617);
createPCFArray("Constraint 1", 12, 12923.5);
createPCFArray("Constraint 1", 13, 0.23045);
createPCFArray("Constraint 1", 14, 12924.5);
createPCFArray("Constraint 1", 15, 0.24474);
createPCFArray("Constraint 1", 16, 12927.5);
createPCFArray("Constraint 1", 17, 0.10714);
createPCFArray("Constraint 1", 18, 12928.5);
createPCFArray("Constraint 1", 19, 0.06429);
createPCFArray("Constraint 1", 20, 12930.5);
createPCFArray("Constraint 1", 21, 0.0);
createPCFArray("Constraint 1", 22, 12964.5);
createPCFArray("Constraint 1", 23, 0.30938);
createPCFArray("Constraint 1", 24, 12966.5);
createPCFArray("Constraint 1", 25, 0.25938);
createPCFArray("Constraint 1", 26, 12967.5);
createPCFArray("Constraint 1", 27, 0.10286);
createPCFArray("Constraint 1", 28, 12970.5);
createPCFArray("Constraint 1", 29, 0.05143);
createPCFArray("Constraint 1", 30, 12971.5);
createPCFArray("Constraint 1", 31, 0.0);
createPCFArray("Constraint 1", 32, 13013.5);
createPCFArray("Constraint 1", 33, 0.26793);
createPCFArray("Constraint 1", 34, 13014.5);
createPCFArray("Constraint 1", 35, 0.30236);
createPCFArray("Constraint 1", 36, 13015.5);
createPCFArray("Constraint 1", 37, 0.14583);
createPCFArray("Constraint 1", 38, 13017.5);
createPCFArray("Constraint 1", 39, 0.1625);
createPCFArray("Constraint 1", 40, 13018.5);
createPCFArray("Constraint 1", 41, 0.05);
createPCFArray("Constraint 1", 42, 13021.5);
createPCFArray("Constraint 1", 43, 0.0);
createPCFArray("Constraint 1", 44, 13058.5);
createPCFArray("Constraint 1", 45, 0.13333);
createPCFArray("Constraint 1", 46, 13060.5);
createPCFArray("Constraint 1", 47, 0.06667);
createPCFArray("Constraint 1", 48, 13062.5);
createPCFArray("Constraint 1", 49, 0.0);
createPCFArray("Constraint 1", 50, 13104.5);
createPCFArray("Constraint 1", 51, 0.13714);
createPCFArray("Constraint 1", 52, 13106.5);
createPCFArray("Constraint 1", 53, 0.18714);
createPCFArray("Constraint 1", 54, 13107.5);
createPCFArray("Constraint 1", 55, 0.23);
createPCFArray("Constraint 1", 56, 13108.5);
createPCFArray("Constraint 1", 57, 0.31333);
createPCFArray("Constraint 1", 58, 13109.5);
createPCFArray("Constraint 1", 59, 0.2619);
createPCFArray("Constraint 1", 60, 13113.5);
createPCFArray("Constraint 1", 61, 0.13333);
createPCFArray("Constraint 1", 62, 13115.5);
createPCFArray("Constraint 1", 63, 0.06667);
createPCFArray("Constraint 1", 64, 13117.5);
createPCFArray("Constraint 1", 65, 0.0);
createPCFArray("Constraint 1", 66, 13153.5);
createPCFArray("Constraint 1", 67, 0.21352);
createPCFArray("Constraint 1", 68, 13154.5);
createPCFArray("Constraint 1", 69, 0.28989);
createPCFArray("Constraint 1", 70, 13155.5);
createPCFArray("Constraint 1", 71, 0.1778);
createPCFArray("Constraint 1", 72, 13157.5);
createPCFArray("Constraint 1", 73, 0.19209);
createPCFArray("Constraint 1", 74, 13158.5);
createPCFArray("Constraint 1", 75, 0.20637);
createPCFArray("Constraint 1", 76, 13160.5);
createPCFArray("Constraint 1", 77, 0.13714);
createPCFArray("Constraint 1", 78, 13161.5);
createPCFArray("Constraint 1", 79, 0.18714);
createPCFArray("Constraint 1", 80, 13162.5);
createPCFArray("Constraint 1", 81, 0.10143);
createPCFArray("Constraint 1", 82, 13163.5);
createPCFArray("Constraint 1", 83, 0.05143);
createPCFArray("Constraint 1", 84, 13164.5);
createPCFArray("Constraint 1", 85, 0.0);
createPCFArray("Constraint 1", 86, 13202.5);
createPCFArray("Constraint 1", 87, 0.30231);
createPCFArray("Constraint 1", 88, 13203.5);
createPCFArray("Constraint 1", 89, 0.3166);
createPCFArray("Constraint 1", 90, 13204.5);
createPCFArray("Constraint 1", 91, 0.26923);
createPCFArray("Constraint 1", 92, 13205.5);
createPCFArray("Constraint 1", 93, 0.14066);
createPCFArray("Constraint 1", 94, 13206.5);
createPCFArray("Constraint 1", 95, 0.15495);
createPCFArray("Constraint 1", 96, 13207.5);
createPCFArray("Constraint 1", 97, 0.08571);
createPCFArray("Constraint 1", 98, 13208.5);
createPCFArray("Constraint 1", 99, 0.04286);
createPCFArray("Constraint 1", 100, 13210.5);
createPCFArray("Constraint 1", 101, 0.0);
createPCFArray("Constraint 1", 102, 13251.5);
createPCFArray("Constraint 1", 103, 0.03158);
createPCFArray("Constraint 1", 104, 13255.5);
createPCFArray("Constraint 1", 105, 0.04737);
createPCFArray("Constraint 1", 106, 13258.5);
createPCFArray("Constraint 1", 107, 0.0);

var transitionarray = [];
createTransitionArray("Constraint 1", 0, 12915.5, "2014.258:00:00:00", 1115899200000, 0.10286, 0.0, 0.0);
createTransitionArray("Constraint 1", 1, 12916.5, "2014.259:00:00:00", 1115985600000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 1", 2, 12917.5, "2014.260:00:00:00", 1116072000000, 0.04286, 0.0, 0.0);
createTransitionArray("Constraint 1", 3, 12918.5, "2014.261:00:00:00", 1116158400000, 0.1703, 0.0, 0.0);
createTransitionArray("Constraint 1", 4, 12919.5, "2014.262:00:00:00", 1116244800000, 0.21617, 0.0, 0.0);
createTransitionArray("Constraint 1", 5, 12923.5, "2014.266:00:00:00", 1116590400000, 0.23045, 0.0, 0.0);
createTransitionArray("Constraint 1", 6, 12924.5, "2014.267:00:00:00", 1116676800000, 0.24474, 0.0, 0.0);
createTransitionArray("Constraint 1", 7, 12927.5, "2014.270:00:00:00", 1116936000000, 0.10714, 0.0, 0.0);
createTransitionArray("Constraint 1", 8, 12928.5, "2014.271:00:00:00", 1117022400000, 0.06429, 0.0, 0.0);
createTransitionArray("Constraint 1", 9, 12930.5, "2014.273:00:00:00", 1117195200000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 1", 10, 12964.5, "2014.307:00:00:00", 1120132800000, 0.30938, 0.0, 0.0);
createTransitionArray("Constraint 1", 11, 12966.5, "2014.309:00:00:00", 1120305600000, 0.25938, 0.0, 0.0);
createTransitionArray("Constraint 1", 12, 12967.5, "2014.310:00:00:00", 1120392000000, 0.10286, 0.0, 0.0);
createTransitionArray("Constraint 1", 13, 12970.5, "2014.313:00:00:00", 1120651200000, 0.05143, 0.0, 0.0);
createTransitionArray("Constraint 1", 14, 12971.5, "2014.314:00:00:00", 1120737600000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 1", 15, 13013.5, "2014.356:00:00:00", 1124366400000, 0.26793, 0.0, 0.0);
createTransitionArray("Constraint 1", 16, 13014.5, "2014.357:00:00:00", 1124452800000, 0.30236, 0.0, 0.0);
createTransitionArray("Constraint 1", 17, 13015.5, "2014.358:00:00:00", 1124539200000, 0.14583, 0.0, 0.0);
createTransitionArray("Constraint 1", 18, 13017.5, "2014.360:00:00:00", 1124712000000, 0.1625, 0.0, 0.0);
createTransitionArray("Constraint 1", 19, 13018.5, "2014.361:00:00:00", 1124798400000, 0.05, 0.0, 0.0);
createTransitionArray("Constraint 1", 20, 13021.5, "2014.364:00:00:00", 1125057600000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 1", 21, 13058.5, "2015.036:00:00:00", 1128254400000, 0.13333, 0.0, 0.0);
createTransitionArray("Constraint 1", 22, 13060.5, "2015.038:00:00:00", 1128427200000, 0.06667, 0.0, 0.0);
createTransitionArray("Constraint 1", 23, 13062.5, "2015.040:00:00:00", 1128600000000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 1", 24, 13104.5, "2015.082:00:00:00", 1132228800000, 0.13714, 0.0, 0.0);
createTransitionArray("Constraint 1", 25, 13106.5, "2015.084:00:00:00", 1132401600000, 0.18714, 0.0, 0.0);
createTransitionArray("Constraint 1", 26, 13107.5, "2015.085:00:00:00", 1132488000000, 0.23, 0.0, 0.0);
createTransitionArray("Constraint 1", 27, 13108.5, "2015.086:00:00:00", 1132574400000, 0.31333, 0.0, 0.0);
createTransitionArray("Constraint 1", 28, 13109.5, "2015.087:00:00:00", 1132660800000, 0.2619, 0.0, 0.0);
createTransitionArray("Constraint 1", 29, 13113.5, "2015.091:00:00:00", 1133006400000, 0.13333, 0.0, 0.0);
createTransitionArray("Constraint 1", 30, 13115.5, "2015.093:00:00:00", 1133179200000, 0.06667, 0.0, 0.0);
createTransitionArray("Constraint 1", 31, 13117.5, "2015.095:00:00:00", 1133352000000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 1", 32, 13153.5, "2015.131:00:00:00", 1136462400000, 0.21352, 0.0, 0.0);
createTransitionArray("Constraint 1", 33, 13154.5, "2015.132:00:00:00", 1136548800000, 0.28989, 0.0, 0.0);
createTransitionArray("Constraint 1", 34, 13155.5, "2015.133:00:00:00", 1136635200000, 0.1778, 0.0, 0.0);
createTransitionArray("Constraint 1", 35, 13157.5, "2015.135:00:00:00", 1136808000000, 0.19209, 0.0, 0.0);
createTransitionArray("Constraint 1", 36, 13158.5, "2015.136:00:00:00", 1136894400000, 0.20637, 0.0, 0.0);
createTransitionArray("Constraint 1", 37, 13160.5, "2015.138:00:00:00", 1137067200000, 0.13714, 0.0, 0.0);
createTransitionArray("Constraint 1", 38, 13161.5, "2015.139:00:00:00", 1137153600000, 0.18714, 0.0, 0.0);
createTransitionArray("Constraint 1", 39, 13162.5, "2015.140:00:00:00", 1137240000000, 0.10143, 0.0, 0.0);
createTransitionArray("Constraint 1", 40, 13163.5, "2015.141:00:00:00", 1137326400000, 0.05143, 0.0, 0.0);
createTransitionArray("Constraint 1", 41, 13164.5, "2015.142:00:00:00", 1137412800000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 1", 42, 13202.5, "2015.180:00:00:00", 1140696000000, 0.30231, 0.0, 0.0);
createTransitionArray("Constraint 1", 43, 13203.5, "2015.181:00:00:00", 1140782400000, 0.3166, 0.0, 0.0);
createTransitionArray("Constraint 1", 44, 13204.5, "2015.182:00:00:00", 1140868800000, 0.26923, 0.0, 0.0);
createTransitionArray("Constraint 1", 45, 13205.5, "2015.183:00:00:00", 1140955200000, 0.14066, 0.0, 0.0);
createTransitionArray("Constraint 1", 46, 13206.5, "2015.184:00:00:00", 1141041600000, 0.15495, 0.0, 0.0);
createTransitionArray("Constraint 1", 47, 13207.5, "2015.185:00:00:00", 1141128000000, 0.08571, 0.0, 0.0);
createTransitionArray("Constraint 1", 48, 13208.5, "2015.186:00:00:00", 1141214400000, 0.04286, 0.0, 0.0);
createTransitionArray("Constraint 1", 49, 13210.5, "2015.188:00:00:00", 1141387200000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 1", 50, 13251.5, "2015.229:00:00:00", 1144929600000, 0.03158, 0.0, 0.0);
createTransitionArray("Constraint 1", 51, 13255.5, "2015.233:00:00:00", 1145275200000, 0.04737, 0.0, 0.0);
createTransitionArray("Constraint 1", 52, 13258.5, "2015.236:00:00:00", 1145534400000, 0.0, 0.0, 0.0);

drawPCFData("Constraint 1", 12879.5, 13266.5, 6, 0);
addOverlay("Constraint 1-overlay");
addCanvas("Constraint 1");
addIndicatorListener("Constraint 1", 0, 80, 1500, 12879.5, 13266.5);


// CONSTRAINT 2
var pcfarray = [];
createPCFArray("Constraint 2", 0, -66666666666666);
createPCFArray("Constraint 2", 1, 0.0);
createPCFArray("Constraint 2", 2, 12880.5);
createPCFArray("Constraint 2", 3, 0.04737);
createPCFArray("Constraint 2", 4, 12881.5);
createPCFArray("Constraint 2", 5, 0.0);
createPCFArray("Constraint 2", 6, 12915.5);
createPCFArray("Constraint 2", 7, 0.10286);
createPCFArray("Constraint 2", 8, 12916.5);
createPCFArray("Constraint 2", 9, 0.05143);
createPCFArray("Constraint 2", 10, 12917.5);
createPCFArray("Constraint 2", 11, 0.07286);
createPCFArray("Constraint 2", 12, 12918.5);
createPCFArray("Constraint 2", 13, 0.15801);
createPCFArray("Constraint 2", 14, 12919.5);
createPCFArray("Constraint 2", 15, 0.22023);
createPCFArray("Constraint 2", 16, 12920.5);
createPCFArray("Constraint 2", 17, 0.21617);
createPCFArray("Constraint 2", 18, 12923.5);
createPCFArray("Constraint 2", 19, 0.23045);
createPCFArray("Constraint 2", 20, 12924.5);
createPCFArray("Constraint 2", 21, 0.24474);
createPCFArray("Constraint 2", 22, 12927.5);
createPCFArray("Constraint 2", 23, 0.19286);
createPCFArray("Constraint 2", 24, 12928.5);
createPCFArray("Constraint 2", 25, 0.23571);
createPCFArray("Constraint 2", 26, 12930.5);
createPCFArray("Constraint 2", 27, 0.20357);
createPCFArray("Constraint 2", 28, 12931.5);
createPCFArray("Constraint 2", 29, 0.11786);
createPCFArray("Constraint 2", 30, 12932.5);
createPCFArray("Constraint 2", 31, 0.03214);
createPCFArray("Constraint 2", 32, 12934.5);
createPCFArray("Constraint 2", 33, 0.0);
createPCFArray("Constraint 2", 34, 12964.5);
createPCFArray("Constraint 2", 35, 0.30938);
createPCFArray("Constraint 2", 36, 12966.5);
createPCFArray("Constraint 2", 37, 0.35938);
createPCFArray("Constraint 2", 38, 12967.5);
createPCFArray("Constraint 2", 39, 0.33737);
createPCFArray("Constraint 2", 40, 12968.5);
createPCFArray("Constraint 2", 41, 0.28112);
createPCFArray("Constraint 2", 42, 12970.5);
createPCFArray("Constraint 2", 43, 0.1554);
createPCFArray("Constraint 2", 44, 12971.5);
createPCFArray("Constraint 2", 45, 0.05143);
createPCFArray("Constraint 2", 46, 12974.5);
createPCFArray("Constraint 2", 47, 0.02571);
createPCFArray("Constraint 2", 48, 12975.5);
createPCFArray("Constraint 2", 49, 0.0);
createPCFArray("Constraint 2", 50, 13013.5);
createPCFArray("Constraint 2", 51, 0.21372);
createPCFArray("Constraint 2", 52, 13014.5);
createPCFArray("Constraint 2", 53, 0.26322);
createPCFArray("Constraint 2", 54, 13015.5);
createPCFArray("Constraint 2", 55, 0.14583);
createPCFArray("Constraint 2", 56, 13017.5);
createPCFArray("Constraint 2", 57, 0.1625);
createPCFArray("Constraint 2", 58, 13018.5);
createPCFArray("Constraint 2", 59, 0.10625);
createPCFArray("Constraint 2", 60, 13021.5);
createPCFArray("Constraint 2", 61, 0.15625);
createPCFArray("Constraint 2", 62, 13023.5);
createPCFArray("Constraint 2", 63, 0.1);
createPCFArray("Constraint 2", 64, 13024.5);
createPCFArray("Constraint 2", 65, 0.0);
createPCFArray("Constraint 2", 66, 13055.5);
createPCFArray("Constraint 2", 67, 0.05);
createPCFArray("Constraint 2", 68, 13056.5);
createPCFArray("Constraint 2", 69, 0.0);
createPCFArray("Constraint 2", 70, 13058.5);
createPCFArray("Constraint 2", 71, 0.13333);
createPCFArray("Constraint 2", 72, 13060.5);
createPCFArray("Constraint 2", 73, 0.1);
createPCFArray("Constraint 2", 74, 13062.5);
createPCFArray("Constraint 2", 75, 0.13095);
createPCFArray("Constraint 2", 76, 13063.5);
createPCFArray("Constraint 2", 77, 0.06667);
createPCFArray("Constraint 2", 78, 13066.5);
createPCFArray("Constraint 2", 79, 0.03333);
createPCFArray("Constraint 2", 80, 13067.5);
createPCFArray("Constraint 2", 81, 0.0);
createPCFArray("Constraint 2", 82, 13104.5);
createPCFArray("Constraint 2", 83, 0.28714);
createPCFArray("Constraint 2", 84, 13106.5);
createPCFArray("Constraint 2", 85, 0.33714);
createPCFArray("Constraint 2", 86, 13107.5);
createPCFArray("Constraint 2", 87, 0.51929);
createPCFArray("Constraint 2", 88, 13108.5);
createPCFArray("Constraint 2", 89, 0.73476);
createPCFArray("Constraint 2", 90, 13109.5);
createPCFArray("Constraint 2", 91, 0.70905);
createPCFArray("Constraint 2", 92, 13111.5);
createPCFArray("Constraint 2", 93, 0.38762);
createPCFArray("Constraint 2", 94, 13113.5);
createPCFArray("Constraint 2", 95, 0.19762);
createPCFArray("Constraint 2", 96, 13115.5);
createPCFArray("Constraint 2", 97, 0.16429);
createPCFArray("Constraint 2", 98, 13117.5);
createPCFArray("Constraint 2", 99, 0.13095);
createPCFArray("Constraint 2", 100, 13118.5);
createPCFArray("Constraint 2", 101, 0.0);
createPCFArray("Constraint 2", 102, 13153.5);
createPCFArray("Constraint 2", 103, 0.27352);
createPCFArray("Constraint 2", 104, 13154.5);
createPCFArray("Constraint 2", 105, 0.34989);
createPCFArray("Constraint 2", 106, 13155.5);
createPCFArray("Constraint 2", 107, 0.46198);
createPCFArray("Constraint 2", 108, 13156.5);
createPCFArray("Constraint 2", 109, 0.48769);
createPCFArray("Constraint 2", 110, 13157.5);
createPCFArray("Constraint 2", 111, 0.50198);
createPCFArray("Constraint 2", 112, 13158.5);
createPCFArray("Constraint 2", 113, 0.43055);
createPCFArray("Constraint 2", 114, 13159.5);
createPCFArray("Constraint 2", 115, 0.34484);
createPCFArray("Constraint 2", 116, 13160.5);
createPCFArray("Constraint 2", 117, 0.17176);
createPCFArray("Constraint 2", 118, 13161.5);
createPCFArray("Constraint 2", 119, 0.22176);
createPCFArray("Constraint 2", 120, 13162.5);
createPCFArray("Constraint 2", 121, 0.30747);
createPCFArray("Constraint 2", 122, 13163.5);
createPCFArray("Constraint 2", 123, 0.35747);
createPCFArray("Constraint 2", 124, 13164.5);
createPCFArray("Constraint 2", 125, 0.29714);
createPCFArray("Constraint 2", 126, 13166.5);
createPCFArray("Constraint 2", 127, 0.12571);
createPCFArray("Constraint 2", 128, 13167.5);
createPCFArray("Constraint 2", 129, 0.0);
createPCFArray("Constraint 2", 130, 13202.5);
createPCFArray("Constraint 2", 131, 0.2677);
createPCFArray("Constraint 2", 132, 13203.5);
createPCFArray("Constraint 2", 133, 0.28198);
createPCFArray("Constraint 2", 134, 13204.5);
createPCFArray("Constraint 2", 135, 0.32935);
createPCFArray("Constraint 2", 136, 13205.5);
createPCFArray("Constraint 2", 137, 0.45792);
createPCFArray("Constraint 2", 138, 13206.5);
createPCFArray("Constraint 2", 139, 0.50682);
createPCFArray("Constraint 2", 140, 13207.5);
createPCFArray("Constraint 2", 141, 0.43759);
createPCFArray("Constraint 2", 142, 13208.5);
createPCFArray("Constraint 2", 143, 0.38571);
createPCFArray("Constraint 2", 144, 13209.5);
createPCFArray("Constraint 2", 145, 0.26703);
createPCFArray("Constraint 2", 146, 13210.5);
createPCFArray("Constraint 2", 147, 0.30989);
createPCFArray("Constraint 2", 148, 13213.5);
createPCFArray("Constraint 2", 149, 0.22418);
createPCFArray("Constraint 2", 150, 13214.5);
createPCFArray("Constraint 2", 151, 0.13846);
createPCFArray("Constraint 2", 152, 13215.5);
createPCFArray("Constraint 2", 153, 0.0);
createPCFArray("Constraint 2", 154, 13251.5);
createPCFArray("Constraint 2", 155, 0.03158);
createPCFArray("Constraint 2", 156, 13255.5);
createPCFArray("Constraint 2", 157, 0.04737);
createPCFArray("Constraint 2", 158, 13258.5);
createPCFArray("Constraint 2", 159, 0.09474);
createPCFArray("Constraint 2", 160, 13262.5);
createPCFArray("Constraint 2", 161, 0.0);

var transitionarray = [];
createTransitionArray("Constraint 2", 0, 12880.5, "2014.223:00:00:00", 1112875200000, 0.04737, 0.0, 0.0);
createTransitionArray("Constraint 2", 1, 12881.5, "2014.224:00:00:00", 1112961600000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 2, 12915.5, "2014.258:00:00:00", 1115899200000, 0.10286, 0.0, 0.0);
createTransitionArray("Constraint 2", 3, 12916.5, "2014.259:00:00:00", 1115985600000, 0.05143, 0.0, 0.0);
createTransitionArray("Constraint 2", 4, 12917.5, "2014.260:00:00:00", 1116072000000, 0.07286, 0.0, 0.0);
createTransitionArray("Constraint 2", 5, 12918.5, "2014.261:00:00:00", 1116158400000, 0.15801, 0.0, 0.0);
createTransitionArray("Constraint 2", 6, 12919.5, "2014.262:00:00:00", 1116244800000, 0.22023, 0.0, 0.0);
createTransitionArray("Constraint 2", 7, 12920.5, "2014.263:00:00:00", 1116331200000, 0.21617, 0.0, 0.0);
createTransitionArray("Constraint 2", 8, 12923.5, "2014.266:00:00:00", 1116590400000, 0.23045, 0.0, 0.0);
createTransitionArray("Constraint 2", 9, 12924.5, "2014.267:00:00:00", 1116676800000, 0.24474, 0.0, 0.0);
createTransitionArray("Constraint 2", 10, 12927.5, "2014.270:00:00:00", 1116936000000, 0.19286, 0.0, 0.0);
createTransitionArray("Constraint 2", 11, 12928.5, "2014.271:00:00:00", 1117022400000, 0.23571, 0.0, 0.0);
createTransitionArray("Constraint 2", 12, 12930.5, "2014.273:00:00:00", 1117195200000, 0.20357, 0.0, 0.0);
createTransitionArray("Constraint 2", 13, 12931.5, "2014.274:00:00:00", 1117281600000, 0.11786, 0.0, 0.0);
createTransitionArray("Constraint 2", 14, 12932.5, "2014.275:00:00:00", 1117368000000, 0.03214, 0.0, 0.0);
createTransitionArray("Constraint 2", 15, 12934.5, "2014.277:00:00:00", 1117540800000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 16, 12964.5, "2014.307:00:00:00", 1120132800000, 0.30938, 0.0, 0.0);
createTransitionArray("Constraint 2", 17, 12966.5, "2014.309:00:00:00", 1120305600000, 0.35938, 0.0, 0.0);
createTransitionArray("Constraint 2", 18, 12967.5, "2014.310:00:00:00", 1120392000000, 0.33737, 0.0, 0.0);
createTransitionArray("Constraint 2", 19, 12968.5, "2014.311:00:00:00", 1120478400000, 0.28112, 0.0, 0.0);
createTransitionArray("Constraint 2", 20, 12970.5, "2014.313:00:00:00", 1120651200000, 0.1554, 0.0, 0.0);
createTransitionArray("Constraint 2", 21, 12971.5, "2014.314:00:00:00", 1120737600000, 0.05143, 0.0, 0.0);
createTransitionArray("Constraint 2", 22, 12974.5, "2014.317:00:00:00", 1120996800000, 0.02571, 0.0, 0.0);
createTransitionArray("Constraint 2", 23, 12975.5, "2014.318:00:00:00", 1121083200000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 24, 13013.5, "2014.356:00:00:00", 1124366400000, 0.21372, 0.0, 0.0);
createTransitionArray("Constraint 2", 25, 13014.5, "2014.357:00:00:00", 1124452800000, 0.26322, 0.0, 0.0);
createTransitionArray("Constraint 2", 26, 13015.5, "2014.358:00:00:00", 1124539200000, 0.14583, 0.0, 0.0);
createTransitionArray("Constraint 2", 27, 13017.5, "2014.360:00:00:00", 1124712000000, 0.1625, 0.0, 0.0);
createTransitionArray("Constraint 2", 28, 13018.5, "2014.361:00:00:00", 1124798400000, 0.10625, 0.0, 0.0);
createTransitionArray("Constraint 2", 29, 13021.5, "2014.364:00:00:00", 1125057600000, 0.15625, 0.0, 0.0);
createTransitionArray("Constraint 2", 30, 13023.5, "2015.001:00:00:00", 1125230400000, 0.1, 0.0, 0.0);
createTransitionArray("Constraint 2", 31, 13024.5, "2015.002:00:00:00", 1125316800000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 32, 13055.5, "2015.033:00:00:00", 1127995200000, 0.05, 0.0, 0.0);
createTransitionArray("Constraint 2", 33, 13056.5, "2015.034:00:00:00", 1128081600000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 34, 13058.5, "2015.036:00:00:00", 1128254400000, 0.13333, 0.0, 0.0);
createTransitionArray("Constraint 2", 35, 13060.5, "2015.038:00:00:00", 1128427200000, 0.1, 0.0, 0.0);
createTransitionArray("Constraint 2", 36, 13062.5, "2015.040:00:00:00", 1128600000000, 0.13095, 0.0, 0.0);
createTransitionArray("Constraint 2", 37, 13063.5, "2015.041:00:00:00", 1128686400000, 0.06667, 0.0, 0.0);
createTransitionArray("Constraint 2", 38, 13066.5, "2015.044:00:00:00", 1128945600000, 0.03333, 0.0, 0.0);
createTransitionArray("Constraint 2", 39, 13067.5, "2015.045:00:00:00", 1129032000000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 40, 13104.5, "2015.082:00:00:00", 1132228800000, 0.28714, 0.0, 0.0);
createTransitionArray("Constraint 2", 41, 13106.5, "2015.084:00:00:00", 1132401600000, 0.33714, 0.0, 0.0);
createTransitionArray("Constraint 2", 42, 13107.5, "2015.085:00:00:00", 1132488000000, 0.51929, 0.0, 0.0);
createTransitionArray("Constraint 2", 43, 13108.5, "2015.086:00:00:00", 1132574400000, 0.73476, 0.0, 0.0);
createTransitionArray("Constraint 2", 44, 13109.5, "2015.087:00:00:00", 1132660800000, 0.70905, 0.0, 0.0);
createTransitionArray("Constraint 2", 45, 13111.5, "2015.089:00:00:00", 1132833600000, 0.38762, 0.0, 0.0);
createTransitionArray("Constraint 2", 46, 13113.5, "2015.091:00:00:00", 1133006400000, 0.19762, 0.0, 0.0);
createTransitionArray("Constraint 2", 47, 13115.5, "2015.093:00:00:00", 1133179200000, 0.16429, 0.0, 0.0);
createTransitionArray("Constraint 2", 48, 13117.5, "2015.095:00:00:00", 1133352000000, 0.13095, 0.0, 0.0);
createTransitionArray("Constraint 2", 49, 13118.5, "2015.096:00:00:00", 1133438400000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 50, 13153.5, "2015.131:00:00:00", 1136462400000, 0.27352, 0.0, 0.0);
createTransitionArray("Constraint 2", 51, 13154.5, "2015.132:00:00:00", 1136548800000, 0.34989, 0.0, 0.0);
createTransitionArray("Constraint 2", 52, 13155.5, "2015.133:00:00:00", 1136635200000, 0.46198, 0.0, 0.0);
createTransitionArray("Constraint 2", 53, 13156.5, "2015.134:00:00:00", 1136721600000, 0.48769, 0.0, 0.0);
createTransitionArray("Constraint 2", 54, 13157.5, "2015.135:00:00:00", 1136808000000, 0.50198, 0.0, 0.0);
createTransitionArray("Constraint 2", 55, 13158.5, "2015.136:00:00:00", 1136894400000, 0.43055, 0.0, 0.0);
createTransitionArray("Constraint 2", 56, 13159.5, "2015.137:00:00:00", 1136980800000, 0.34484, 0.0, 0.0);
createTransitionArray("Constraint 2", 57, 13160.5, "2015.138:00:00:00", 1137067200000, 0.17176, 0.0, 0.0);
createTransitionArray("Constraint 2", 58, 13161.5, "2015.139:00:00:00", 1137153600000, 0.22176, 0.0, 0.0);
createTransitionArray("Constraint 2", 59, 13162.5, "2015.140:00:00:00", 1137240000000, 0.30747, 0.0, 0.0);
createTransitionArray("Constraint 2", 60, 13163.5, "2015.141:00:00:00", 1137326400000, 0.35747, 0.0, 0.0);
createTransitionArray("Constraint 2", 61, 13164.5, "2015.142:00:00:00", 1137412800000, 0.29714, 0.0, 0.0);
createTransitionArray("Constraint 2", 62, 13166.5, "2015.144:00:00:00", 1137585600000, 0.12571, 0.0, 0.0);
createTransitionArray("Constraint 2", 63, 13167.5, "2015.145:00:00:00", 1137672000000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 64, 13202.5, "2015.180:00:00:00", 1140696000000, 0.2677, 0.0, 0.0);
createTransitionArray("Constraint 2", 65, 13203.5, "2015.181:00:00:00", 1140782400000, 0.28198, 0.0, 0.0);
createTransitionArray("Constraint 2", 66, 13204.5, "2015.182:00:00:00", 1140868800000, 0.32935, 0.0, 0.0);
createTransitionArray("Constraint 2", 67, 13205.5, "2015.183:00:00:00", 1140955200000, 0.45792, 0.0, 0.0);
createTransitionArray("Constraint 2", 68, 13206.5, "2015.184:00:00:00", 1141041600000, 0.50682, 0.0, 0.0);
createTransitionArray("Constraint 2", 69, 13207.5, "2015.185:00:00:00", 1141128000000, 0.43759, 0.0, 0.0);
createTransitionArray("Constraint 2", 70, 13208.5, "2015.186:00:00:00", 1141214400000, 0.38571, 0.0, 0.0);
createTransitionArray("Constraint 2", 71, 13209.5, "2015.187:00:00:00", 1141300800000, 0.26703, 0.0, 0.0);
createTransitionArray("Constraint 2", 72, 13210.5, "2015.188:00:00:00", 1141387200000, 0.30989, 0.0, 0.0);
createTransitionArray("Constraint 2", 73, 13213.5, "2015.191:00:00:00", 1141646400000, 0.22418, 0.0, 0.0);
createTransitionArray("Constraint 2", 74, 13214.5, "2015.192:00:00:00", 1141732800000, 0.13846, 0.0, 0.0);
createTransitionArray("Constraint 2", 75, 13215.5, "2015.193:00:00:00", 1141819200000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 2", 76, 13251.5, "2015.229:00:00:00", 1144929600000, 0.03158, 0.0, 0.0);
createTransitionArray("Constraint 2", 77, 13255.5, "2015.233:00:00:00", 1145275200000, 0.04737, 0.0, 0.0);
createTransitionArray("Constraint 2", 78, 13258.5, "2015.236:00:00:00", 1145534400000, 0.09474, 0.0, 0.0);
createTransitionArray("Constraint 2", 79, 13262.5, "2015.240:00:00:00", 1145880000000, 0.0, 0.0, 0.0);

drawPCFData("Constraint 2", 12879.5, 13266.5, 6, 0);
addOverlay("Constraint 2-overlay");
addCanvas("Constraint 2");
addIndicatorListener("Constraint 2", 0, 80, 1500, 12879.5, 13266.5);


// CONSTRAINT 3
var pcfarray = [];
createPCFArray("Constraint 3", 0, -66666666666666);
createPCFArray("Constraint 3", 1, 0.0);
createPCFArray("Constraint 3", 2, 12915.1);
createPCFArray("Constraint 3", 3, 0.18759);
createPCFArray("Constraint 3", 4, 12916.1);
createPCFArray("Constraint 3", 5, 0.15902);
createPCFArray("Constraint 3", 6, 12917.1);
createPCFArray("Constraint 3", 7, 0.11617);
createPCFArray("Constraint 3", 8, 12918.1);
createPCFArray("Constraint 3", 9, 0.03158);
createPCFArray("Constraint 3", 10, 12919.1);
createPCFArray("Constraint 3", 11, 0.0);

var transitionarray = [];
createTransitionArray("Constraint 3", 0, 12915.1, "2014.257:14:24:00", 1115864640000, 0.18759, 0.0, 0.0);
createTransitionArray("Constraint 3", 1, 12916.1, "2014.258:14:24:00", 1115951040000, 0.15902, 0.0, 0.0);
createTransitionArray("Constraint 3", 2, 12917.1, "2014.259:14:24:00", 1116037440000, 0.11617, 0.0, 0.0);
createTransitionArray("Constraint 3", 3, 12918.1, "2014.260:14:24:00", 1116123840000, 0.03158, 0.0, 0.0);
createTransitionArray("Constraint 3", 4, 12919.1, "2014.261:14:24:00", 1116210240000, 0.0, 0.0, 0.0);

drawPCFData("Constraint 3", 12879.5, 13266.5, 6, 0);
addOverlay("Constraint 3-overlay");
addCanvas("Constraint 3");
addIndicatorListener("Constraint 3", 0, 80, 1500, 12879.5, 13266.5);


// CONSTRAINT 4
var pcfarray = [];
createPCFArray("Constraint 4", 0, -66666666666666);
createPCFArray("Constraint 4", 1, 0.0);
createPCFArray("Constraint 4", 2, 12922.5);
createPCFArray("Constraint 4", 3, 0.05195);
createPCFArray("Constraint 4", 4, 12929.5);
createPCFArray("Constraint 4", 5, 0.0);
createPCFArray("Constraint 4", 6, 12936.5);
createPCFArray("Constraint 4", 7, 0.07792);
createPCFArray("Constraint 4", 8, 12943.5);
createPCFArray("Constraint 4", 9, 0.0);
createPCFArray("Constraint 4", 10, 12978.5);
createPCFArray("Constraint 4", 11, 0.09091);
createPCFArray("Constraint 4", 12, 12985.5);
createPCFArray("Constraint 4", 13, 0.0);
createPCFArray("Constraint 4", 14, 13013.5);
createPCFArray("Constraint 4", 15, 0.07792);
createPCFArray("Constraint 4", 16, 13020.5);
createPCFArray("Constraint 4", 17, 0.01299);
createPCFArray("Constraint 4", 18, 13027.5);
createPCFArray("Constraint 4", 19, 0.07792);
createPCFArray("Constraint 4", 20, 13034.5);
createPCFArray("Constraint 4", 21, 0.0);
createPCFArray("Constraint 4", 22, 13062.5);
createPCFArray("Constraint 4", 23, 0.05195);
createPCFArray("Constraint 4", 24, 13069.5);
createPCFArray("Constraint 4", 25, 0.01299);
createPCFArray("Constraint 4", 26, 13076.5);
createPCFArray("Constraint 4", 27, 0.0);
createPCFArray("Constraint 4", 28, 13118.5);
createPCFArray("Constraint 4", 29, 0.14286);
createPCFArray("Constraint 4", 30, 13125.5);
createPCFArray("Constraint 4", 31, 0.07792);
createPCFArray("Constraint 4", 32, 13132.5);
createPCFArray("Constraint 4", 33, 0.0);
createPCFArray("Constraint 4", 34, 13167.5);
createPCFArray("Constraint 4", 35, 0.07792);
createPCFArray("Constraint 4", 36, 13174.5);
createPCFArray("Constraint 4", 37, 0.0);
createPCFArray("Constraint 4", 38, 13202.5);
createPCFArray("Constraint 4", 39, 0.03896);
createPCFArray("Constraint 4", 40, 13209.5);
createPCFArray("Constraint 4", 41, 0.01299);
createPCFArray("Constraint 4", 42, 13216.5);
createPCFArray("Constraint 4", 43, 0.03896);
createPCFArray("Constraint 4", 44, 13223.5);
createPCFArray("Constraint 4", 45, 0.0);
createPCFArray("Constraint 4", 46, 13258.5);
createPCFArray("Constraint 4", 47, 0.01299);
createPCFArray("Constraint 4", 48, 13265.5);
createPCFArray("Constraint 4", 49, 0.0);

var transitionarray = [];
createTransitionArray("Constraint 4", 0, 12922.5, "2014.265:00:00:00", 1116504000000, 0.05195, 0.0, 0.0);
createTransitionArray("Constraint 4", 1, 12929.5, "2014.272:00:00:00", 1117108800000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 4", 2, 12936.5, "2014.279:00:00:00", 1117713600000, 0.07792, 0.0, 0.0);
createTransitionArray("Constraint 4", 3, 12943.5, "2014.286:00:00:00", 1118318400000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 4", 4, 12978.5, "2014.321:00:00:00", 1121342400000, 0.09091, 0.0, 0.0);
createTransitionArray("Constraint 4", 5, 12985.5, "2014.328:00:00:00", 1121947200000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 4", 6, 13013.5, "2014.356:00:00:00", 1124366400000, 0.07792, 0.0, 0.0);
createTransitionArray("Constraint 4", 7, 13020.5, "2014.363:00:00:00", 1124971200000, 0.01299, 0.0, 0.0);
createTransitionArray("Constraint 4", 8, 13027.5, "2015.005:00:00:00", 1125576000000, 0.07792, 0.0, 0.0);
createTransitionArray("Constraint 4", 9, 13034.5, "2015.012:00:00:00", 1126180800000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 4", 10, 13062.5, "2015.040:00:00:00", 1128600000000, 0.05195, 0.0, 0.0);
createTransitionArray("Constraint 4", 11, 13069.5, "2015.047:00:00:00", 1129204800000, 0.01299, 0.0, 0.0);
createTransitionArray("Constraint 4", 12, 13076.5, "2015.054:00:00:00", 1129809600000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 4", 13, 13118.5, "2015.096:00:00:00", 1133438400000, 0.14286, 0.0, 0.0);
createTransitionArray("Constraint 4", 14, 13125.5, "2015.103:00:00:00", 1134043200000, 0.07792, 0.0, 0.0);
createTransitionArray("Constraint 4", 15, 13132.5, "2015.110:00:00:00", 1134648000000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 4", 16, 13167.5, "2015.145:00:00:00", 1137672000000, 0.07792, 0.0, 0.0);
createTransitionArray("Constraint 4", 17, 13174.5, "2015.152:00:00:00", 1138276800000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 4", 18, 13202.5, "2015.180:00:00:00", 1140696000000, 0.03896, 0.0, 0.0);
createTransitionArray("Constraint 4", 19, 13209.5, "2015.187:00:00:00", 1141300800000, 0.01299, 0.0, 0.0);
createTransitionArray("Constraint 4", 20, 13216.5, "2015.194:00:00:00", 1141905600000, 0.03896, 0.0, 0.0);
createTransitionArray("Constraint 4", 21, 13223.5, "2015.201:00:00:00", 1142510400000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 4", 22, 13258.5, "2015.236:00:00:00", 1145534400000, 0.01299, 0.0, 0.0);
createTransitionArray("Constraint 4", 23, 13265.5, "2015.243:00:00:00", 1146139200000, 0.0, 0.0, 0.0);

drawPCFData("Constraint 4", 12879.5, 13266.5, 6, 0);
addOverlay("Constraint 4-overlay");
addCanvas("Constraint 4");
addIndicatorListener("Constraint 4", 0, 80, 1500, 12879.5, 13266.5);


// CONSTRAINT 5
var pcfarray = [];
createPCFArray("Constraint 5", 0, -66666666666666);
createPCFArray("Constraint 5", 1, 0.0);
createPCFArray("Constraint 5", 2, 12880.5);
createPCFArray("Constraint 5", 3, 0.11165);
createPCFArray("Constraint 5", 4, 12881.5);
createPCFArray("Constraint 5", 5, 0.15902);
createPCFArray("Constraint 5", 6, 12887.5);
createPCFArray("Constraint 5", 7, 0.0);
createPCFArray("Constraint 5", 8, 12915.5);
createPCFArray("Constraint 5", 9, 0.04765);
createPCFArray("Constraint 5", 10, 12916.5);
createPCFArray("Constraint 5", 11, 0.08301);
createPCFArray("Constraint 5", 12, 12917.5);
createPCFArray("Constraint 5", 13, 0.05143);
createPCFArray("Constraint 5", 14, 12920.5);
createPCFArray("Constraint 5", 15, 0.10286);
createPCFArray("Constraint 5", 16, 12930.5);
createPCFArray("Constraint 5", 17, 0.135);
createPCFArray("Constraint 5", 18, 12934.5);
createPCFArray("Constraint 5", 19, 0.16714);
createPCFArray("Constraint 5", 20, 12936.5);
createPCFArray("Constraint 5", 21, 0.0);
createPCFArray("Constraint 5", 22, 12967.5);
createPCFArray("Constraint 5", 23, 0.13451);
createPCFArray("Constraint 5", 24, 12968.5);
createPCFArray("Constraint 5", 25, 0.19076);
createPCFArray("Constraint 5", 26, 12970.5);
createPCFArray("Constraint 5", 27, 0.21648);
createPCFArray("Constraint 5", 28, 12971.5);
createPCFArray("Constraint 5", 29, 0.32045);
createPCFArray("Constraint 5", 30, 12974.5);
createPCFArray("Constraint 5", 31, 0.34616);
createPCFArray("Constraint 5", 32, 12975.5);
createPCFArray("Constraint 5", 33, 0.37188);
createPCFArray("Constraint 5", 34, 12978.5);
createPCFArray("Constraint 5", 35, 0.26902);
createPCFArray("Constraint 5", 36, 12985.5);
createPCFArray("Constraint 5", 37, 0.0);
createPCFArray("Constraint 5", 38, 13013.5);
createPCFArray("Constraint 5", 39, 0.1);
createPCFArray("Constraint 5", 40, 13018.5);
createPCFArray("Constraint 5", 41, 0.23625);
createPCFArray("Constraint 5", 42, 13019.5);
createPCFArray("Constraint 5", 43, 0.05625);
createPCFArray("Constraint 5", 44, 13023.5);
createPCFArray("Constraint 5", 45, 0.1125);
createPCFArray("Constraint 5", 46, 13027.5);
createPCFArray("Constraint 5", 47, 0.0);
createPCFArray("Constraint 5", 48, 13055.5);
createPCFArray("Constraint 5", 49, 0.05);
createPCFArray("Constraint 5", 50, 13056.5);
createPCFArray("Constraint 5", 51, 0.1);
createPCFArray("Constraint 5", 52, 13060.5);
createPCFArray("Constraint 5", 53, 0.13333);
createPCFArray("Constraint 5", 54, 13061.5);
createPCFArray("Constraint 5", 55, 0.27179);
createPCFArray("Constraint 5", 56, 13062.5);
createPCFArray("Constraint 5", 57, 0.36941);
createPCFArray("Constraint 5", 58, 13063.5);
createPCFArray("Constraint 5", 59, 0.29524);
createPCFArray("Constraint 5", 60, 13066.5);
createPCFArray("Constraint 5", 61, 0.32857);
createPCFArray("Constraint 5", 62, 13067.5);
createPCFArray("Constraint 5", 63, 0.3619);
createPCFArray("Constraint 5", 64, 13068.5);
createPCFArray("Constraint 5", 65, 0.2619);
createPCFArray("Constraint 5", 66, 13072.5);
createPCFArray("Constraint 5", 67, 0.31333);
createPCFArray("Constraint 5", 68, 13073.5);
createPCFArray("Constraint 5", 69, 0.13333);
createPCFArray("Constraint 5", 70, 13075.5);
createPCFArray("Constraint 5", 71, 0.0);
createPCFArray("Constraint 5", 72, 13109.5);
createPCFArray("Constraint 5", 73, 0.02571);
createPCFArray("Constraint 5", 74, 13113.5);
createPCFArray("Constraint 5", 75, 0.11571);
createPCFArray("Constraint 5", 76, 13115.5);
createPCFArray("Constraint 5", 77, 0.28751);
createPCFArray("Constraint 5", 78, 13117.5);
createPCFArray("Constraint 5", 79, 0.32084);
createPCFArray("Constraint 5", 80, 13118.5);
createPCFArray("Constraint 5", 81, 0.18);
createPCFArray("Constraint 5", 82, 13120.5);
createPCFArray("Constraint 5", 83, 0.33);
createPCFArray("Constraint 5", 84, 13123.5);
createPCFArray("Constraint 5", 85, 0.18);
createPCFArray("Constraint 5", 86, 13125.5);
createPCFArray("Constraint 5", 87, 0.0);
createPCFArray("Constraint 5", 88, 13160.5);
createPCFArray("Constraint 5", 89, 0.03462);
createPCFArray("Constraint 5", 90, 13164.5);
createPCFArray("Constraint 5", 91, 0.09495);
createPCFArray("Constraint 5", 92, 13167.5);
createPCFArray("Constraint 5", 93, 0.06923);
createPCFArray("Constraint 5", 94, 13174.5);
createPCFArray("Constraint 5", 95, 0.0);

var transitionarray = [];
createTransitionArray("Constraint 5", 0, 12880.5, "2014.223:00:00:00", 1112875200000, 0.11165, 0.0, 0.0);
createTransitionArray("Constraint 5", 1, 12881.5, "2014.224:00:00:00", 1112961600000, 0.15902, 0.0, 0.0);
createTransitionArray("Constraint 5", 2, 12887.5, "2014.230:00:00:00", 1113480000000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 5", 3, 12915.5, "2014.258:00:00:00", 1115899200000, 0.04765, 0.0, 0.0);
createTransitionArray("Constraint 5", 4, 12916.5, "2014.259:00:00:00", 1115985600000, 0.08301, 0.0, 0.0);
createTransitionArray("Constraint 5", 5, 12917.5, "2014.260:00:00:00", 1116072000000, 0.05143, 0.0, 0.0);
createTransitionArray("Constraint 5", 6, 12920.5, "2014.263:00:00:00", 1116331200000, 0.10286, 0.0, 0.0);
createTransitionArray("Constraint 5", 7, 12930.5, "2014.273:00:00:00", 1117195200000, 0.135, 0.0, 0.0);
createTransitionArray("Constraint 5", 8, 12934.5, "2014.277:00:00:00", 1117540800000, 0.16714, 0.0, 0.0);
createTransitionArray("Constraint 5", 9, 12936.5, "2014.279:00:00:00", 1117713600000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 5", 10, 12967.5, "2014.310:00:00:00", 1120392000000, 0.13451, 0.0, 0.0);
createTransitionArray("Constraint 5", 11, 12968.5, "2014.311:00:00:00", 1120478400000, 0.19076, 0.0, 0.0);
createTransitionArray("Constraint 5", 12, 12970.5, "2014.313:00:00:00", 1120651200000, 0.21648, 0.0, 0.0);
createTransitionArray("Constraint 5", 13, 12971.5, "2014.314:00:00:00", 1120737600000, 0.32045, 0.0, 0.0);
createTransitionArray("Constraint 5", 14, 12974.5, "2014.317:00:00:00", 1120996800000, 0.34616, 0.0, 0.0);
createTransitionArray("Constraint 5", 15, 12975.5, "2014.318:00:00:00", 1121083200000, 0.37188, 0.0, 0.0);
createTransitionArray("Constraint 5", 16, 12978.5, "2014.321:00:00:00", 1121342400000, 0.26902, 0.0, 0.0);
createTransitionArray("Constraint 5", 17, 12985.5, "2014.328:00:00:00", 1121947200000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 5", 18, 13013.5, "2014.356:00:00:00", 1124366400000, 0.1, 0.0, 0.0);
createTransitionArray("Constraint 5", 19, 13018.5, "2014.361:00:00:00", 1124798400000, 0.23625, 0.0, 0.0);
createTransitionArray("Constraint 5", 20, 13019.5, "2014.362:00:00:00", 1124884800000, 0.05625, 0.0, 0.0);
createTransitionArray("Constraint 5", 21, 13023.5, "2015.001:00:00:00", 1125230400000, 0.1125, 0.0, 0.0);
createTransitionArray("Constraint 5", 22, 13027.5, "2015.005:00:00:00", 1125576000000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 5", 23, 13055.5, "2015.033:00:00:00", 1127995200000, 0.05, 0.0, 0.0);
createTransitionArray("Constraint 5", 24, 13056.5, "2015.034:00:00:00", 1128081600000, 0.1, 0.0, 0.0);
createTransitionArray("Constraint 5", 25, 13060.5, "2015.038:00:00:00", 1128427200000, 0.13333, 0.0, 0.0);
createTransitionArray("Constraint 5", 26, 13061.5, "2015.039:00:00:00", 1128513600000, 0.27179, 0.0, 0.0);
createTransitionArray("Constraint 5", 27, 13062.5, "2015.040:00:00:00", 1128600000000, 0.36941, 0.0, 0.0);
createTransitionArray("Constraint 5", 28, 13063.5, "2015.041:00:00:00", 1128686400000, 0.29524, 0.0, 0.0);
createTransitionArray("Constraint 5", 29, 13066.5, "2015.044:00:00:00", 1128945600000, 0.32857, 0.0, 0.0);
createTransitionArray("Constraint 5", 30, 13067.5, "2015.045:00:00:00", 1129032000000, 0.3619, 0.0, 0.0);
createTransitionArray("Constraint 5", 31, 13068.5, "2015.046:00:00:00", 1129118400000, 0.2619, 0.0, 0.0);
createTransitionArray("Constraint 5", 32, 13072.5, "2015.050:00:00:00", 1129464000000, 0.31333, 0.0, 0.0);
createTransitionArray("Constraint 5", 33, 13073.5, "2015.051:00:00:00", 1129550400000, 0.13333, 0.0, 0.0);
createTransitionArray("Constraint 5", 34, 13075.5, "2015.053:00:00:00", 1129723200000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 5", 35, 13109.5, "2015.087:00:00:00", 1132660800000, 0.02571, 0.0, 0.0);
createTransitionArray("Constraint 5", 36, 13113.5, "2015.091:00:00:00", 1133006400000, 0.11571, 0.0, 0.0);
createTransitionArray("Constraint 5", 37, 13115.5, "2015.093:00:00:00", 1133179200000, 0.28751, 0.0, 0.0);
createTransitionArray("Constraint 5", 38, 13117.5, "2015.095:00:00:00", 1133352000000, 0.32084, 0.0, 0.0);
createTransitionArray("Constraint 5", 39, 13118.5, "2015.096:00:00:00", 1133438400000, 0.18, 0.0, 0.0);
createTransitionArray("Constraint 5", 40, 13120.5, "2015.098:00:00:00", 1133611200000, 0.33, 0.0, 0.0);
createTransitionArray("Constraint 5", 41, 13123.5, "2015.101:00:00:00", 1133870400000, 0.18, 0.0, 0.0);
createTransitionArray("Constraint 5", 42, 13125.5, "2015.103:00:00:00", 1134043200000, 0.0, 0.0, 0.0);
createTransitionArray("Constraint 5", 43, 13160.5, "2015.138:00:00:00", 1137067200000, 0.03462, 0.0, 0.0);
createTransitionArray("Constraint 5", 44, 13164.5, "2015.142:00:00:00", 1137412800000, 0.09495, 0.0, 0.0);
createTransitionArray("Constraint 5", 45, 13167.5, "2015.145:00:00:00", 1137672000000, 0.06923, 0.0, 0.0);
createTransitionArray("Constraint 5", 46, 13174.5, "2015.152:00:00:00", 1138276800000, 0.0, 0.0, 0.0);

drawPCFData("Constraint 5", 12879.5, 13266.5, 6, 0);
addOverlay("Constraint 5-overlay");
addCanvas("Constraint 5");
addIndicatorListener("Constraint 5", 0, 80, 1500, 12879.5, 13266.5);


drawLocalTimeline("Bottom Timeline", 12879.5, 13266.5);
addOverlay("Bottom Timeline-overlay");
addIndicatorListener("Bottom Timeline", 0, 80, 1500, 12879.5, 13266.5)
