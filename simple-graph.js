registerKeyboardHandler = function(callback) {
  var callback = callback;
  d3.select(window).on("keydown", callback);  
};




Array.prototype.prevIndex = function(index) // can return -1
{
    for(; index > 0; --index)
    {
        if(null != this[index])
        {
            break;
        }
    }

    return index;
}
Array.prototype.nextIndex = function(index)
{
    for(; index < this.length-1; ++index)
    {
        if(null != this[index])
        {
            break;
        }
    }

    return index;
}



function MechData()
{
    this.oMechs_by_type = oMechsByType;
    this.oMechs_by_tonnage = new Array();
    for(var kMechType in mechs)
    {
        var mech = mechs[kMechType];
        var tonnage = mech.tonnage;
        
        if(this.mechs_by_tonnage[tonnage] == null)
        {
            this.mechs_by_tonnage[tonnage] = new Array();
        }
        this.mechs_by_tonnage[tonnage].push(mech);
    }

    this.aEngineWeight_STD = aEngineWeight_STD;
    this.aEngineWeight_XL = aEngineWeight_XL;
}
MechData.prototype.listAvailableEngines_between = function(minRating, maxRating, XL)
{
    var engines = XL ? this.aEngineWeight_XL : this.aEngineWeight_STD;

    minRating = engines.nextIndex(minRating);
    maxRating = engines.prevIndex(maxRating);

    var aRet = new Array();
    do
    {
        aRet.push(minRating);
        minRating = engines.nextIndex(minRating+1);
    }while(minRating <= maxRating)

    return aRet;
}




#BEGIN ERROR: NO SUPPORT FOR FILTERS==============================================
// lists all available engines in [min, max], where
// min: minimum engine rating of all 'Mechs with that tonnage
// max: (like min)
MechData.prototype.listEngines_for_mechMaxTonnage = function(mechMaxTonnage, XL)
{
    var engines = XL ? this.aEngineWeight_XL : this.aEngineWeight_STD;
    
    var minEngineRating = engines.nextIndex(0);
    var maxEngineRating = engines.prevIndex(engines.length-1);
    
    for(var kMechType in this.oMechs_by_tonnage[mechMaxTonnage])
    {
        var variants  = this.oMechs_by_tonnage[mechMaxTonnage][kMechType];
        for(var kMechVariant in variants)
        {
            var variant = variants[kMechVariant];
            
            minEngineRating = Math.min(minEngineRating, variant.minEngineRating);
            maxEngineRating = Math.max(maxEngineRating, variant.maxEngineRating);
        }
    }

    return listAvailableEngines_between(minEngineRating, maxEngineRating);
}
// returns an Array of 'Mech tonnages, where each array element
// is an Array of engines returned by listEngines_for_tonnage
MechData.prototype.listEngines_by_mechMaxTonnage = function()
{
    var ret = new Array();

    for(var kTonnage in this.oMechs_by_tonnage)
    {
        ret.push( this.listEngines_for_mechMaxTonnage(kTonnage) );
    }

    return ret;
}
#END ERROR: NO SUPPORT FOR FILTERS====================================================
MechData.prototype.maxSpeed = function(maxTonnage, engineRating)
{
    return engineRating / maxTonnage * 16.2;
}
MechData.prototype.weight_internalStructure = function(mechMaxTonnage, endo)
{
    return mechMaxTonnage * (endo ? 0.05 : 0.10);
}
MechData.prototype.weight_maxArmor = function(mechMaxTonnage, ferro)
{
    var getSomeElement = function(obj) { for(var prop in obj) return obj.prop; }
    // some 'Mech type of that tonnage
    var someMechType = getSomeElement(this.oMechs_by_tonnage[mechMaxTonnage]);
    
    return someMechType.maxArmor / 32.0 * (ferro ? 0.88 : 1.0);
}
MechData.prototype.weight_requiredHS = function(engineRating)
{
    var internalHS = engineRating / 25;
    var requiredHS = 10;
    var hsWeight = 1;   // a heat sink weighs 1 ton
    return Math.max(0, hsWeight * (requiredHS - internalHS));
}
MechData.prototype.weight_engine = function(engineRating, XL)
{
    var engines = XL ? this.aEngineWeight_XL : this.aEngineWeight_STD;

    return engines[engineRating];
}
// using max armor and all modifiers for all 'Mechs
MechData.prototype.payload_simple = function(mechMaxTonnage, engineRating, XL, endo, ferro)
{
    var payload = mechMaxTonnage;
        payload -= this.weight_engine(engineRating, XL);
        payload -= this.weight_requiredHS(engineRating);
        payload -= this.weight_internalStructure(mechMaxTonnage, endo);
        payload -= this.weight_maxArmor(mechMaxTonnage, ferro);
    return payload;
}


SimpleGraph = function(elemid, options) {
  var self = this;

  // get the <div> node with id elemid
  this.div_chart = document.getElementById(elemid);
  
  // short-cut for client size
  this.cx = this.div_chart.clientWidth;
  this.cy = this.div_chart.clientHeight;
  
  // set default options
  this.options = options || {};
  this.options.xmax = options.xmax || 30;
  this.options.xmin = options.xmin || 0;
  this.options.ymax = options.ymax || 10;
  this.options.ymin = options.ymin || 0;
  
  // adjust style according to options (e.g. add padding for title)
  this.padding = {
     "top":    this.options.title  ? 40 : 20,
     "right":                 30,
     "bottom": this.options.xlabel ? 60 : 10,
     "left":   this.options.ylabel ? 70 : 45
  };
  
  // calculate chart canvas size (excluding title and axis labels)
  this.size = {
    "width":  this.cx - this.padding.left - this.padding.right,
    "height": this.cy - this.padding.top  - this.padding.bottom
  };

  // x scaling function
  this.x = d3.scale.linear()
      .domain([this.options.xmin, this.options.xmax])
      .range([0, this.size.width]);

  // drag x-axis logic
  this.downx = Math.NaN;

  // y scaling (inverted domain for mathematical COS)
  this.y = d3.scale.linear()
      .domain([this.options.ymax, this.options.ymin])
      .nice()
      .range([0, this.size.height])
      .nice();

  // drag y-axis logic
  this.downy = Math.NaN;

  this.dragged = this.selected = null;

  // function to map data point -> x/y coordinates,
  // using the x-scaling `this.x` and y-scaling `this.y`
  this.line = d3.svg.line()
      .x(function(d, i) { return this.x(d.x); })
      .y(function(d, i) { return this.y(d.y); });

  //+ create data points
      /*var xRangeSize =  (this.options.xmax - this.options.xmin);
      var yRangeSize_half = (this.options.ymax - this.options.ymin) / 2;
      var yRangeSize_quarter = yRangeSize_half / 2;
      var datacount = this.size.width/30;
      
      var createRandomDataPoints = function(i)
      {
          return {   x: i * xRangeSize / datacount
                   , y: this.options.ymin + yRangeSize_quarter + Math.random() * yRangeSize_half };
      };
      
      this.points  = d3.range(datacount).map(createRandomDataPoints, self);
      this.points2 = d3.range(datacount).map(createRandomDataPoints, self);
      */
      this.data = new MechData();
  //- data points created
  
  
  // append main <svg> node to chart <div> node
  this.mainSvg = d3.select(this.div_chart).append("svg")
      .attr("width",  this.cx)
      .attr("height", this.cy);
  
  // add a SVG group and translate it to the designated chart canvas position
  this.vis = this.mainSvg.append("g")
        .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");
   
  // create an grey background rectangle
  this.chartBg = this.vis.append("rect")
      .attr("id", "chartBg")
      .attr("width", this.size.width)
      .attr("height", this.size.height)
      .style("fill", "#EEEEEE")
      .attr("pointer-events", "all")
      .on("mousedown.drag", self.plot_drag())
      .on("touchstart.drag", self.plot_drag());
  
  // add event handler for zooming
  var zoom = d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw());
  this.chartBg.call(zoom);

  this.gGrid = this.vis.append("g")
      .attr("id", "gGrid");
  
  // add a clip rectangle for the data lines
  this.vis.append("defs").append("svg:clipPath")
    .attr("id", "chartContentClip")
    .append("svg:rect")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", this.size.width)
    .attr("height", this.size.height);
  
  // add a group for the data lines
  var gLines = this.vis.append("g")
    .attr("clip-path", "url(#chartContentClip)");
  
  //+ add data lines
      /*
      gLines.append("path")
        .attr("class", "line line1")
        .attr("id", "line1")
        .attr("d", this.line(this.points));
      
      gLines.append("path")
        .attr("class", "line line2")
        .attr("id", "line2")
        .attr("d", this.line(this.points2));
      */

  //- data lines added
  
  // add Chart Title
  if (this.options.title) {
    this.vis.append("text")
        .attr("class", "axis")
        .text(this.options.title)
        .attr("x", this.size.width/2)
        .attr("dy","-0.8em")
        .style("text-anchor","middle");
  }

  // Add the x-axis label
  if (this.options.xlabel) {
    this.vis.append("text")
        .attr("class", "axis")
        .text(this.options.xlabel)
        .attr("x", this.size.width/2)
        .attr("y", this.size.height)
        .attr("dy","2.4em")
        .style("text-anchor","middle");
  }

  // add y-axis label
  if (this.options.ylabel) {
    this.vis.append("g").append("text")
        .attr("class", "axis")
        .text(this.options.ylabel)
        .style("text-anchor","middle")
        .attr("transform","translate(" + -40 + " " + this.size.height/2+") rotate(-90)");
  }

  d3.select(this.div_chart)
      .on("mousemove.drag", self.mousemove())
      .on("touchmove.drag", self.mousemove())
      .on("mouseup.drag",   self.mouseup())
      .on("touchend.drag",  self.mouseup());

  this.redraw()();
};
  
//
// SimpleGraph methods
//

SimpleGraph.prototype.plot_drag = function() {
  var self = this;
  return function() {
    registerKeyboardHandler(self.keydown());
    d3.select('body').style("cursor", "move");
    if (d3.event.altKey) {
      var p = d3.svg.mouse(self.vis.node());
      var newpoint = {};
      newpoint.x = self.x.invert(Math.max(0, Math.min(self.size.width,  p[0])));
      newpoint.y = self.y.invert(Math.max(0, Math.min(self.size.height, p[1])));
      self.points.push(newpoint);
      self.points.sort(function(a, b) {
        if (a.x < b.x) { return -1 };
        if (a.x > b.x) { return  1 };
        return 0
      });
      self.points2.push(newpoint);
      self.points2.sort(function(a, b) {
        if (a.x < b.x) { return -1 };
        if (a.x > b.x) { return  1 };
        return 0
      });
      self.selected = newpoint;
      self.update();
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }    
  }
};

SimpleGraph.prototype.update = function() {
  var self = this;
  //var lines = this.vis.select("path").attr("d", this.line(this.points));
  this.vis.select("#line1").attr("d", this.line(this.points));
  this.vis.select("#line2").attr("d", this.line(this.points2));

  /*
  var circle = this.vis.select("svg").selectAll("circle")
      .data(this.points, function(d) { return d; });

  circle.enter().append("circle")
      .attr("class", function(d) { return d === self.selected ? "selected" : null; })
      .attr("cx",    function(d) { return self.x(d.x); })
      .attr("cy",    function(d) { return self.y(d.y); })
      .attr("r", 10.0)
      .style("cursor", "ns-resize")
      .on("mousedown.drag",  self.datapoint_drag())
      .on("touchstart.drag", self.datapoint_drag());

  circle
      .attr("class", function(d) { return d === self.selected ? "selected" : null; })
      .attr("cx",    function(d) { 
        return self.x(d.x); })
      .attr("cy",    function(d) { return self.y(d.y); });

  circle.exit().remove();
  */
  if (d3.event && d3.event.keyCode) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }
}

SimpleGraph.prototype.datapoint_drag = function() {
  var self = this;
  return function(d) {
    registerKeyboardHandler(self.keydown());
    document.onselectstart = function() { return false; };
    self.selected = self.dragged = d;
    self.update();
    
  }
};

SimpleGraph.prototype.mousemove = function() {
  var self = this;
  return function() {
    var p = d3.svg.mouse(self.vis[0][0]),
        t = d3.event.changedTouches;
    
    if (self.dragged) {
      self.dragged.y = self.y.invert(Math.max(0, Math.min(self.size.height, p[1])));
      self.update();
    };
    if (!isNaN(self.downx)) {
      d3.select('body').style("cursor", "ew-resize");
      var rupx = self.x.invert(p[0]),
          xaxis1 = self.x.domain()[0],
          xaxis2 = self.x.domain()[1],
          xextent = xaxis2 - xaxis1;
      if (rupx != 0) {
        var changex, new_domain;
        changex = self.downx / rupx;
        new_domain = [xaxis1, xaxis1 + (xextent * changex)];
        self.x.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      d3.select('body').style("cursor", "ns-resize");
      var rupy = self.y.invert(p[1]),
          yaxis1 = self.y.domain()[1],
          yaxis2 = self.y.domain()[0],
          yextent = yaxis2 - yaxis1;
      if (rupy != 0) {
        var changey, new_domain;
        changey = self.downy / rupy;
        new_domain = [yaxis1 + (yextent * changey), yaxis1];
        self.y.domain(new_domain);
        self.redraw()();
      }
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }
};

SimpleGraph.prototype.mouseup = function() {
  var self = this;
  return function() {
    document.onselectstart = function() { return true; };
    d3.select('body').style("cursor", "auto");
    d3.select('body').style("cursor", "auto");
    if (!isNaN(self.downx)) {
      self.redraw()();
      self.downx = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      self.redraw()();
      self.downy = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
    if (self.dragged) { 
      self.dragged = null 
    }
  }
}

SimpleGraph.prototype.keydown = function() {
  var self = this;
  return function() {
    if (!self.selected) return;
    switch (d3.event.keyCode) {
      case 8: // backspace
      case 46: { // delete
        var i = self.points.indexOf(self.selected);
        self.points.splice(i, 1);
        self.selected = self.points.length ? self.points[i > 0 ? i - 1 : 0] : null;
        self.update();
        break;
      }
    }
  }
};

SimpleGraph.prototype.redraw = function() {
  var self = this;
  return function() {
    var tx = function(d) { 
      return "translate(" + self.x(d) + ",0)"; 
    },
    ty = function(d) { 
      return "translate(0," + self.y(d) + ")";
    },
    stroke = function(d) { 
      return d ? "#ccc" : "#666"; 
    },
    fx = self.x.tickFormat(10),
    fy = self.y.tickFormat(10);

    // Regenerate x-ticks…
    var gx = self.gGrid.selectAll("g.x")
        .data(self.x.ticks(10), String)
        .attr("transform", tx);

    gx.select("text")
        .text(fx);

    var gxe = gx.enter().insert("g", "a")
        .attr("class", "x")
        .attr("transform", tx);

    gxe.append("line")
        .attr("stroke", stroke)
        .attr("y1", 0)
        .attr("y2", self.size.height);

    gxe.append("text")
        .attr("class", "axis")
        .attr("y", self.size.height)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text(fx)
        .style("cursor", "ew-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.xaxis_drag())
        .on("touchstart.drag", self.xaxis_drag());

    gx.exit().remove();

    // Regenerate y-ticks…
    var gy = self.gGrid.selectAll("g.y")
        .data(self.y.ticks(10), String)
        .attr("transform", ty);

    gy.select("text")
        .text(fy);

    var gye = gy.enter().insert("g", "a")
        .attr("class", "y")
        .attr("transform", ty)
        .attr("background-fill", "#FFEEB6");

    gye.append("line")
        .attr("stroke", stroke)
        .attr("x1", 0)
        .attr("x2", self.size.width);

    gye.append("text")
        .attr("class", "axis")
        .attr("x", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(fy)
        .style("cursor", "ns-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.yaxis_drag())
        .on("touchstart.drag", self.yaxis_drag());

    gy.exit().remove();
    
    
    self.chartBg.call(d3.behavior.zoom().x(self.x).y(self.y).on("zoom", self.redraw()));
    self.update();    
  }  
}

SimpleGraph.prototype.xaxis_drag = function() {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.svg.mouse(self.vis[0][0]);
    self.downx = self.x.invert(p[0]);
  }
};

SimpleGraph.prototype.yaxis_drag = function(d) {
  var self = this;
  return function(d) {
    document.onselectstart = function() { return false; };
    var p = d3.svg.mouse(self.vis[0][0]);
    self.downy = self.y.invert(p[1]);
  }
};
