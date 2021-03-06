"use strict";


//Array.prototype.prevIndex = function(index) // can return -1
function prevIndex(arr, index)
{
    for(; index > 0; --index)
    {
        if(null != arr[index])
        {
            break;
        }
    }

    return index;
}
//Array.prototype.nextIndex = function(index)
function nextIndex(arr, index)
{
    for(; index < arr.length-1; ++index)
    {
        if(null != arr[index])
        {
            break;
        }
    }

    return index;
}


//+ from https://gist.github.com/Wolfy87/5734530
	/**
	 * Performs a binary search on the host array. This method can either be
	 * injected into Array.prototype or called with a specified scope like this:
	 * binaryIndexOf.call(someArray, searchElement);
	 *
	 * @param {*} searchElement The item to search for within the array.
	 * @return {Number} The index of the element which defaults to -1 when not found.
	 */
	function binaryIndexOf(searchElement) {
		'use strict';
	 
		var minIndex = 0;
		var maxIndex = this.length - 1;
		var currentIndex;
		var currentElement;
	 
		while (minIndex <= maxIndex) {
			currentIndex = (minIndex + maxIndex) / 2 | 0;
			currentElement = this[currentIndex];
	 
			if (currentElement < searchElement) {
				minIndex = currentIndex + 1;
			}
			else if (currentElement > searchElement) {
				maxIndex = currentIndex - 1;
			}
			else {
				return currentIndex;
			}
		}
	 
		return -1;
	}
//- from https://gist.github.com/Wolfy87/5734530

// Performs a binary search on haystack, returns an interval {beg, end}, where
//     beg: index of biggest element smaller than needle
//     end: index of smallest element bigger than needle
// uses the result of fAccessor(aHaystack[key]) to compare against needle
function intervalIn(aHaystack, needle, fAccessor)
{
    // binary search code from https://gist.github.com/Wolfy87/5734530
    var minIndex = 0;
    var maxIndex = aHaystack.length - 1;
    var currentIndex;
    var currentElement;
        
    while (minIndex <= maxIndex)
    {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = fAccessor(aHaystack[currentIndex]);
 
        if (currentElement < needle)
        {
            var nextElement = currentIndex < aHaystack.length-1
                      ? fAccessor(aHaystack[currentIndex+1]) : currentElement;
            if(nextElement > needle)
            {
                return {beg: currentIndex, end: currentIndex+1};
            }else
            {
                minIndex = currentIndex + 1;
            }
        }else if (currentElement > needle)
        {
            var prevElement = currentIndex > 0
                      ? fAccessor(aHaystack[currentIndex-1]) : currentElement;
            if(prevElement < needle)
            {
                return {beg: currentIndex-1, end: currentIndex};
            }else
            {
                maxIndex = currentIndex - 1;
            }
        }else
        {
            return {beg: currentIndex, end: currentIndex};
        }
    }
    
    return {beg: -1, end: -1};
}

    function intervalIn_f(aHaystack, needle, fAccessor, fComp)
    {
        // binary search code from https://gist.github.com/Wolfy87/5734530
        var minIndex = 0;
        var maxIndex = aHaystack.length - 1;
        var currentIndex;
        var currentElement;
            
        while (minIndex <= maxIndex)
        {
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = fAccessor(aHaystack[currentIndex]);
     
            if (fComp(currentElement, needle))
            {
                var nextElement = currentIndex < aHaystack.length-1
                          ? fAccessor(aHaystack[currentIndex+1]) : currentElement;
                if(fComp(needle, nextElement))
                {
                    return {beg: currentIndex, end: currentIndex+1};
                }else
                {
                    minIndex = currentIndex + 1;
                }
            }else if (fComp(needle, currentElement))
            {
                var prevElement = currentIndex > 0
                          ? fAccessor(aHaystack[currentIndex-1]) : currentElement;
                if(fComp(prevElement, needle))
                {
                    return {beg: currentIndex-1, end: currentIndex};
                }else
                {
                    maxIndex = currentIndex - 1;
                }
            }else
            {
                return {beg: currentIndex, end: currentIndex};
            }
        }
        
        return {beg: -1, end: -1};
    }


function getSomeElement(obj)
{
    for(var prop in obj)
        return obj[prop];
}


function getDistinctColor(index)
{
    // from http://stackoverflow.com/a/12224359
    var palette = ["#000000", "#00FF00", "#0000FF", "#FF0000", "#01FFFE", "#FFA6FE", "#FFDB66", "#006401", "#010067", "#95003A", "#007DB5", "#FF00F6", /*"#FFEEE8", */"#774D00", "#90FB92", "#0076FF", "#D5FF00", "#FF937E", "#6A826C", "#FF029D", "#FE8900", "#7A4782", "#7E2DD2", "#85A900", "#FF0056", "#A42400", "#00AE7E", "#683D3B", "#BDC6FF", "#263400", "#BDD393", "#00B917", "#9E008E", "#001544", "#C28C9F", "#FF74A3", "#01D0FF", "#004754", "#E56FFE", "#788231", "#0E4CA1", "#91D0CB", "#BE9970", "#968AE8", "#BB8800", "#43002C", "#DEFF74", "#00FFC6", "#FFE502", "#620E00", "#008F9C", "#98FF52", "#7544B1", "#B500FF", "#00FF78", "#FF6E41", "#005F39", "#6B6882", "#5FAD4E", "#A75740", "#A5FFD2", "#FFB167", "#009BFF", "#E85EBE"];
    
    index = index > palette.length-1 ? 0 : index;

    return palette[index];
}


var MechData =
{
      oAllMechsByType: oMechsByType
    , aEngineWeights_STD: aEngineWeights_STD
    , aEngineWeights_XL: aEngineWeights_XL
};

MechData.listAvailableEngines_between = function(p_minRating, p_maxRating, p_isXL)
{
    var engines = p_isXL ? MechData.aEngineWeights_XL : MechData.aEngineWeights_STD;

    p_minRating = nextIndex(engines, p_minRating);
    p_maxRating = prevIndex(engines, p_maxRating);

    var aRet = new Array();
    do
    {
        aRet.push(p_minRating);
        p_minRating = nextIndex(engines, p_minRating+1);
    }while(p_minRating <= p_maxRating)

    return aRet;
}

// returns a sparse Array
MechData.sortByTonnage = function(p_oMechsByType)
{
    var aMechsByTonnage = new Array();
    
    for(var kMechType in p_oMechsByType)
    {
        var mechType = p_oMechsByType[kMechType];
        var tonnage = mechType.maxTonnage;
        
        if(typeof aMechsByTonnage[tonnage] === 'undefined' || aMechsByTonnage[tonnage] === null)
        {
            aMechsByTonnage[tonnage] = new Array();
        }
        if(! mechType.hasOwnProperty("name"))
        {
            mechType.name = kMechType;
        }
        aMechsByTonnage[tonnage].push(mechType);
    }

    return aMechsByTonnage;
}

// lists all available engines in [min, max], where
//   min: minimum engine rating of all passed 'Mechs
//   max: (like min)
// returns an Array of engine ratings
MechData.listEngines_for_mechs = function(p_oMechsByType, p_isXL)
{
    var engines = p_isXL ? MechData.aEngineWeights_XL : MechData.aEngineWeights_STD;
    
    var minEngineRating = prevIndex(engines, engines.length-1);
    var maxEngineRating = nextIndex(engines, 0);
    
    for(var kMechType in p_oMechsByType)
    {
        var oVariants  = p_oMechsByType[kMechType].oVariants;
        for(var kMechVariant in oVariants)
        {
            var variant = oVariants[kMechVariant];
            
            minEngineRating = Math.min(minEngineRating, variant.minEngineRating);
            maxEngineRating = Math.max(maxEngineRating, variant.maxEngineRating);
        }
    }

    return MechData.listAvailableEngines_between(minEngineRating, maxEngineRating);
}
// returns a sparse Array of 'Mech max tonnage |--> engine list,
// where each engine list is a result of listEngines_for_mechs for all 'Mechs with
// the same max tonnage
MechData.listEngines_by_mechMaxTonnage = function(p_aMechsByTonnage, p_isXL)
{
    var ret = new Array();
    
    for(var kTonnage in p_aMechsByTonnage)
    {
        if(!p_aMechsByTonnage.hasOwnProperty(kTonnage))
        {
            continue;
        }

        var oMechTypesWithSameMaxTonnage = p_aMechsByTonnage[kTonnage];
        ret[kTonnage] = MechData.listEngines_for_mechs(oMechTypesWithSameMaxTonnage, p_isXL);
    }

    return ret;
}

// returns an Array of {oMechs, aData}, ordered by 'Mech max Tonnage,
//   aData: an Array of {speed, payload, engineRating} data points,
//         each data point represents one engine rating
//   oMechs: an Object {type_name0:{variant_name:maxEngineIndex}, type_name1...},
//           where `maxEngineIndex` is the index in aData of the data point for the max engine rating
// 
// the parameter `fPayload` shall be a function
//     {mech:{maxTonnage, maxArmor}, engine:{rating, isXL}} |--> payload
MechData.createDataPoints = function(p_aMechsByTonnage, p_isXL, p_fPayload)
{
    var engines_by_mechMaxTonnage = MechData.listEngines_by_mechMaxTonnage(p_aMechsByTonnage, p_isXL);

    var ret = new Array();
    
    for(var kTonnage in p_aMechsByTonnage)
    {
        if(!p_aMechsByTonnage.hasOwnProperty(kTonnage))
        {
            continue;
        }

        var oMechTypes = p_aMechsByTonnage[kTonnage];
        var aEngineRatings = engines_by_mechMaxTonnage[kTonnage];

        var currEntry = {oMechs: new Object(), aData: new Array()};
        
        // add variants with their max engine indices
        for(var kMechType in oMechTypes)
        {
            var typeName = oMechTypes[kMechType].name;
            var oVariants = oMechTypes[kMechType].oVariants;

            currEntry.oMechs[typeName] = new Object();
            for(var kVariant in oVariants)
            {
                var variant = oVariants[kVariant];
                var indexOfMaxEngine = binaryIndexOf.call(aEngineRatings, variant.maxEngineRating);
                currEntry.oMechs[typeName][kVariant] = indexOfMaxEngine;
            }
        }
        
        // get some mech type for max tonnage and max armor values
        var someMechType = getSomeElement(oMechTypes);
        
        // add speed-payload data points
        for(var iEngineRating = 0; iEngineRating < aEngineRatings.length; ++iEngineRating)
        {
            var currEngineRating = aEngineRatings[iEngineRating];
            var params =
            {
                  mech:   {maxTonnage: someMechType.maxTonnage, maxArmor: someMechType.maxArmor}
                , engine: {rating:currEngineRating, isXL:p_isXL}
            };
            var maxPayload = p_fPayload(params);
            var maxSpeed = MechData.maxSpeed(someMechType.maxTonnage, currEngineRating);

            currEntry.aData.push
                ({
                      speed: maxSpeed
                    , payload: maxPayload
                    , engineRating: currEngineRating
                });
        }
        
        ret.push(currEntry);
    }

    return ret;
}

MechData.maxSpeed = function(p_mechMaxTonnage, p_engineRating)
{
    return p_engineRating / p_mechMaxTonnage * 16.2;
}
MechData.weight_internalStructure = function(p_mechMaxTonnage, endo)
{
    return p_mechMaxTonnage * (endo ? 0.05 : 0.10);
}
MechData.weight_armorPts = function(p_armorPts, p_ferro)
{
    return p_armorPts / 32.0 * (p_ferro ? 0.88 : 1.0);
}
// the weight of additional extra-engine heat sinks to get to the minimum of 10 HS
MechData.weight_additionalHS = function(p_engineRating)
{
    var internalHS = Math.floor(p_engineRating / 25);
    var requiredHS = 10;
    var hsWeight = 1;   // a heat sink weighs 1 ton
    return Math.max(0, hsWeight * (requiredHS - internalHS));
}
MechData.weight_engine = function(p_engineRating, p_isXL)
{
    var engines = p_isXL ? MechData.aEngineWeights_XL : MechData.aEngineWeights_STD;

    return engines[p_engineRating];
}
// using max armor and all modifiers for all 'Mechs
MechData.payload_simple = function(p_obj)
{
    var payload = p_obj.mech.maxTonnage;
        payload -= MechData.weight_engine(p_obj.engine.rating, p_obj.engine.isXL);
        payload -= MechData.weight_additionalHS(p_obj.engine.rating);
        payload -= MechData.weight_internalStructure(p_obj.mech.maxTonnage, false);
        payload -= MechData.weight_armorPts(p_obj.mech.maxArmor, false);
    return payload;
}





var registerKeyboardHandler = function(callback) {
  var callback = callback;
  d3.select(window).on("keydown", callback);  
};


function SimpleGraph(elemid, options)
{
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
     "right":  this.options.ylabel ? 70 : 45,
     "bottom": this.options.xlabel ? 60 : 10,
     "left":   45,
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
  this.lineGen = d3.svg.line()
  //    .x(function(d, i) { return this.x(d.x); })
  //    .x(function(d, i) { return this.x(d.x); })
      .x(function(d) { return this.x(d.speed); })
      .y(function(d) { return this.y(d.payload); });

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
      var allMechs = MechData.oAllMechsByType;
      var allMechsByTonnage = MechData.sortByTonnage(allMechs);
      this.data = MechData.createDataPoints( allMechsByTonnage, false, MechData.payload_simple );
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
      .style("fill", "#EEEEEE");

  this.gGrid = this.vis.append("g")
      .attr("id", "gGrid");
  
  // add a clip rectangle for the chart canvas 
  this.vis.append("defs").append("svg:clipPath")
    .attr("id", "chartContentClip")
    .append("svg:rect")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", this.size.width)
    .attr("height", this.size.height);
  
  var gChartCanvas = this.vis.append("g")
    .attr("id", "gChartCanvas")
    .attr("clip-path", "url(#chartContentClip)");
  
  // add a group for the data lines
  var gLines = gChartCanvas.append("g");
  
  var gLabels = this.vis.append("g")
    .attr("class", "label");
  
  //+ add data lines
      for(var kLine in this.data)
      {
          var lineData = this.data[kLine].aData;

          var color = getDistinctColor(kLine);

          var gLine = gLines.append("g")
            .attr("id", "gLine"+kLine);

          gLine.append("path")
            .attr("class", "line")
            .attr("style", "stroke: "+color)
            .attr("d", this.lineGen(lineData));

          var symbols = gLine.selectAll("circle")
            .data(lineData, function(d){return d;});
          symbols.enter().append("circle")
            .attr("cx", function(d){return self.x(d.speed);})
            .attr("cy", function(d){return self.y(d.payload);})
            .attr("r", 2.0)
            .attr("style", "fill: "+color);
         
          // add type labels
          var xpos = this.x(lineData[0].speed);
          var ypos = this.y(lineData[0].payload);
          
          var gLabel = gLabels.append("g")
            .attr("transform", "translate("+xpos+","+ypos+")")
            .attr("id", "typeLbl"+kLine)
            .attr("style", "fill: "+color);
          
          var label = gLabel.append("text")
            .attr("text-anchor", "end");
          
          var nType = 0;
          for(var kType in this.data[kLine].oMechs)
          {
              label.append("tspan")
                .attr("x", "0")
                .attr("y", nType+"em")
                .text(kType)
              
              ++nType;
          }
      }
  //- data lines added
  
  //+ add a legend
      var legendWidth = 200;
      var legendHeight = 170;

      this.rLegend = this.vis.append("g")
        .attr("id", "gLegend")
        .attr("transform", "translate("+(this.size.width-legendWidth)+",0)");
      
      this.rLegend
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "white")
        .style("stroke", "none");
      
      this.tLegend = this.rLegend
        .append("svg:foreignObject")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .append("xhtml:div")
        .append("xhtml:table").attr("class", "tbLegend");

      this.setLegend(null, null, 0);
  //- legend added
  
  // add an invisible rect overlay for custom event handling
  this.rEventHook = this.vis.append("rect")
    .attr("id", "rEventHook")
    .attr("style", "visibility: hidden")
    .attr("width", this.size.width)
    .attr("height", this.size.height)
    .attr("pointer-events", "all")
    .on("mousedown.drag", self.plot_drag())
    .on("touchstart.drag", self.plot_drag());
  
  // add event handler for zooming
  var zoom = d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw());
  this.rEventHook.call(zoom);
  
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
        .attr("transform","translate(" + (this.size.width+50) + " " + this.size.height/2+") rotate(-90)");
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

SimpleGraph.prototype.setLegend = function(oMechs, oDataPoint, dataIndex)
{
    if(null == oMechs)
    {
        return;
    }

    this.tLegend.selectAll("tr").remove();
    
    var roundedSpeed = Math.round(oDataPoint.speed*10)/10.0;

    {var tr = this.tLegend.append("xhtml:tr");
        tr.append("xhtml:td").classed("descr", true).text("engine:");
        tr.append("xhtml:td").classed("value", true).text(oDataPoint.engineRating);
    }
    {var tr = this.tLegend.append("xhtml:tr");
        tr.append("xhtml:td").classed("descr", true).text("speed:");
        tr.append("xhtml:td").classed("value", true).text(roundedSpeed);
    }
    {var tr = this.tLegend.append("xhtml:tr");
        tr.append("xhtml:td").classed("descr", true).text("payload:");
        tr.append("xhtml:td").classed("value", true).text(oDataPoint.payload);
    }
    var variants;
    {var tr = this.tLegend.append("xhtml:tr");
        tr.append("xhtml:td").classed("descr", true).text("'Mechs:");
        variants = tr.append("xhtml:td").classed("value", true).append("xhtml:table");
    }

    for(var kMech in oMechs)
    {
        var mech = oMechs[kMech];

        var tr = variants.append("xhtml:tr");
          tr.append("xhtml:td").text(kMech);

        var text = "";
        for(var kVariant in mech)
        {
            if(mech[kVariant] >= dataIndex)
            {
                text += kVariant.substr(kMech.length+1)+"; ";
            }
        }

        tr.append("xhtml:td").text(text);
    }
};

SimpleGraph.prototype.plot_drag = function() {
  var self = this;
  return function() {
    registerKeyboardHandler(self.keydown());
    d3.select('body').style("cursor", "move");
  }
};

SimpleGraph.prototype.update = function() {
  var self = this;
  //+ update lines
      for(var kLine in this.data)
      {
          var lineData = this.data[kLine].aData;
          var gLine = this.vis.select("#gLine"+kLine);
          
          gLine.select("path").attr("d", this.lineGen(lineData));

          // adjust symbols
          var symbols = gLine
            .selectAll("circle")
            .data(lineData)
            .attr("cx", function(d){return self.x(d.speed);})
            .attr("cy", function(d){return self.y(d.payload);})
            .attr("r", 2);
            
          // adjust type labels
          var xpos = this.x(lineData[0].speed);
          var ypos = this.y(lineData[0].payload);
          var invisible = false;
          if(xpos < 0)
          {
              var interval = intervalIn(lineData, 0, function(d){return self.x(d.speed)});
              if(interval.beg != -1)
              {
                  if(   interval.beg != interval.end
                     && lineData[interval.beg].payload != lineData[interval.end].payload)
                  {
                      var beg = {  x: this.x(lineData[interval.beg].speed)
                                 , y: this.y(lineData[interval.beg].payload) };
                      var end = {  x: this.x(lineData[interval.end].speed)
                                 , y: this.y(lineData[interval.end].payload) };
                      
                      var gradient = (end.y - beg.y) / (end.x - beg.x);
                      
                      var interpolation = gradient * (0 - beg.x);
                      interpolation += beg.y;

                      ypos = interpolation;
                  }else
                  {
                      ypos = this.y(lineData[interval.beg].payload);
                  }
              }else
              {
                  invisible = true;
              }
          }
          if(ypos < 0 && !invisible)
          {
              ypos = 0;

              var interval = intervalIn_f(lineData, self.y.domain()[0], function(d){return d.payload;},
                                          function(a,b){return a>b;});
              if(interval.beg != -1)
              {
                  if(   interval.beg != interval.end
                     && lineData[interval.beg].payload != lineData[interval.end].payload)
                  {
                      var beg = {  x: this.x(lineData[interval.beg].speed)
                                 , y: this.y(lineData[interval.beg].payload) };
                      var end = {  x: this.x(lineData[interval.end].speed)
                                 , y: this.y(lineData[interval.end].payload) };
                      
                      var gradient = (end.y - beg.y) / (end.x - beg.x);
                      
                      var interpolation = (0 - beg.y) / gradient;
                      interpolation += beg.x;
                      console.log(beg.y +":"+ self.size.height);

                      xpos = interpolation;
                  }else
                  {
                      xpos = this.x(lineData[interval.beg].speed);
                  }
              }else
              {
                  console.log("invs");
                  invisible = true;
              }
          }
          
          if(!invisible)
          {
              this.vis.select("#typeLbl"+kLine)
                .attr("transform", "translate("+Math.max(0,xpos)+","+ypos+")")
                .select("text").attr("style", "display: block");
          }else
          {
              this.vis.select("#typeLbl"+kLine)
                .select("text").attr("style", "display: none");
          }
      }
      if(null != self.nearestDataPoint && null != self.nearestDataPoint.pointIndex)
      {
          var gLine = this.vis.select("#gLine"+self.nearestDataPoint.lineIndex);

          var symbols = gLine
            .selectAll("circle");
          d3.select(symbols[0][self.nearestDataPoint.pointIndex])
            .attr("r", 4);
      }
  //- lines updated

  // update legend
  if(null != self.nearestDataPoint && null != self.nearestDataPoint.pointIndex)
  {
      var line = self.data[self.nearestDataPoint.lineIndex];
      var index = self.nearestDataPoint.pointIndex;
      self.setLegend(line.oMechs, line.aData[index], index);
  }
  
  if (d3.event && d3.event.keyCode) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }
}

SimpleGraph.prototype.mousemove = function()
{
  var self = this;

  return function()
  {
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

    //+ add tooltip
        var pointed = {x: self.x.invert(p[0]), y: self.y.invert(p[1])};
        self.nearestDataPoint = {lineIndex: null, pointIndex: null, dist: Infinity};

        for(var kLine in self.data)
        {
            var lineData = self.data[kLine].aData;

            var interval;
            if(lineData[0].speed > pointed.x)
            {
                interval = {beg: 0, end: 0};
            }else if(lineData[lineData.length-1].speed < pointed.x)
            {
                interval = {beg: lineData.length-1, end: lineData.length-1};
            }else
            {
                interval = intervalIn(lineData, pointed.x, function(d){return d.speed});
            }

            var fDist1 = function(p0, p1) { return Math.abs(p0-p1); };
            
            var nearestIndex;
            if(  fDist1(lineData[interval.beg].speed, pointed.x)
               < fDist1(lineData[interval.end].speed, pointed.x))
            {
                nearestIndex = interval.beg;
            }else
            {
                nearestIndex = interval.end;
            }
            
            var dist = Math.sqrt
            (
                  Math.pow(lineData[nearestIndex].speed - pointed.x, 2)
                + Math.pow(lineData[nearestIndex].payload - pointed.y, 2)
            );

            if(self.nearestDataPoint.dist > dist)
            {
                self.nearestDataPoint.lineIndex = kLine;
                self.nearestDataPoint.pointIndex = nearestIndex;
                self.nearestDataPoint.dist = dist;
            }
        }

        self.update();
    //- tooltip processing
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
};

SimpleGraph.prototype.resetView = function()
{
    this.x.domain([this.options.xmin, this.options.xmax]);
    this.y.domain([this.options.ymax, this.options.ymin]);
    this.redraw()();
};

SimpleGraph.prototype.keydown = function() {
  var self = this;

  return function()
  {
    switch (d3.event.keyCode)
    {
      case 82: // r
        self.resetView();
        break;
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
        .attr("x", self.size.width + 3)
        .attr("dy", ".35em")
        .attr("text-anchor", "begin")
        .text(fy)
        .style("cursor", "ns-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.yaxis_drag())
        .on("touchstart.drag", self.yaxis_drag());

    gy.exit().remove();
    
    
    self.rEventHook.call(d3.behavior.zoom().x(self.x).y(self.y).on("zoom", self.redraw()));
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
