var cssSheet, $scontainer, $pageurl, $txCss, $cssresult, $rtlresult, $txrtlCss;
$(function () {
	$scontainer = $("#stylecontainer");
	$pageurl = $(".pageurl");
	$txCss = $("#txCss");
	$txrtlCss = $("#txrtlCss");

	$cssresult = $("#cssresult");
	$rtlresult = $("#rtlresult");

	$scontainer.load(function (e) {
		// now get the compiled css, and arabize it

		var doc = this.contentDocument;
		

		cssSheet = doc.styleSheets[doc.styleSheets.length - 1];
		

		// TODO: allow for multiple css, this is used because LESS CSS generates a new one at the bottom of the stack, and this suits my needs

		var csstext = cssSheet.ownerNode.textContent;
		csstext = csstext.replace(/\"/gi, "\'");
		// TODO: add replace(/"http://locahost/something"/gi, "") to remove absolute file references

		$txCss.text(csstext);
		$cssresult.slideDown();

	});

	$("#generatecss").click(function (e) {

		// add the src to iframe then load
		$scontainer.attr("src", $pageurl.val());
	});
	$("#generatertl").click(function (e) {
		// now mirror and add to second css textfield
		$txrtlCss.text(rtlAltaf(cssSheet));
		$rtlresult.slideDown();

	});
});



function rtlAltaf(sheet) {
	// this way is better than anything i tried, i just append the new overriding rules to the exisint ones, mirring left to right and resetting lefts
	var str = "";

	for (var i = 0; i < sheet.cssRules.length; i++) {

		var rule = sheet.cssRules[i];

		switch (rule.type) {
			case 1:

				str += rtlMirror(rule);
				break;
			case 4: // media
				var mediastr = "";
				for (var j = 0; j < rule.cssRules.length; j++) {
					mediastr += rtlMirror(rule.cssRules[j]);
				}
				if (mediastr != "") {
					str += "\n@media " + rule.media.mediaText + " { ";
					str += mediastr;
					str += "\n}";
				}

				break;
			default:
				continue;
		}



	}


	return str;
}

function rtlMirror(rule) {

	// check the existence of right or left in css text

	if (rule.cssText.indexOf("left") < 0 && rule.cssText.indexOf("right") < 0 && rule.cssText.indexOf("background-position") < 0) return "";

	var str = "";

	for (var j = 0; j < rule.style.length; j++) {

		var propName = rule.style[j];
		var propPro = (rule.style.getPropertyPriority(propName) != "" ? "!important" : "");

		// if margin or padding, margin-left: 12px => margin-right: 12px; margin-left: 0;
		if (propName.indexOf("left") > -1) {

			// check right, if exists, swap, else zero
			var rPropName = propName.replace("left", "right"),
								value = rule.style.getPropertyValue(propName),
								rvalue = rule.style.getPropertyValue(rPropName);

			if (value == rvalue) continue;

			//newStyle.style.push({ "name": rPropName, "value": value + propPro });
			str += rPropName + ":" + value + propPro + ";\n";

			if (!rvalue) {
				//reset
				rvalue = "0";
				// switch case of width, style and color
				if (propName.indexOf("color") > -1 || propName.indexOf("style") > -1) {
					rvalue = "none";
				} else if (propName === "left") {
					rvalue = "auto";
				}

			}
			//newStyle.style.push({ "name": propName, "value": rvalue + propPro });
			str += propName + ":" + rvalue + propPro + ";\n";
		}
		// if right exists, check left, if defined, move on
		if (propName.indexOf("right") > -1) {
			var lPropName = propName.replace("right", "left"),
								value = rule.style.getPropertyValue(propName),
								lvalue = "0";
			if (rule.style.getPropertyValue(lPropName) == null || rule.style.getPropertyValue(lPropName) === "") {
				//newStyle.style.push({ "name": lPropName, "value": value + propPro });
				str += lPropName + ":" + value + propPro + ";\n";

				// switch case of width, style and color
				if (propName.indexOf("color") > -1 || propName.indexOf("style") > -1) {
					lvalue = "none";
				} else if (propName === "right") {
					lvalue = "auto";
				}
				//newStyle.style.push({ "name": propName, "value": lvalue + propPro });
				str += propName + ":" + lvalue + propPro + ";\n";
			}
		}
		// background position special case
		if (propName == "background-position-x") {
			// experimental, left over 100%, dont fix pixels
			var pValue = rule.style.getPropertyValue("background-position-x");
			if (pValue.indexOf("%") > -1) {
				str += "background-position:" + (100 - parseInt(pValue)) + "% " + rule.style.getPropertyValue("background-position-y");
			}
		}
		// now check values (float basically)
		var pValue = rule.style.getPropertyValue(propName);
		if (pValue.indexOf("left") > -1 || pValue.indexOf("right") > -1) {

			//newStyle.style.push({ "name": propName, "value": (rule.style.getPropertyValue(propName)).replace("left", "tempr").replace("right", "left").replace("tempr", "right") + propPro });
			str += propName + ":" + pValue.replace("left", "tempr").replace("right", "left").replace("tempr", "right") + propPro + ";\n";
		}

	}
	if (str == "") return "";

	// remove :: from selector text

	return "\n" + rule.selectorText.replace(/(::)/gi, ":") + " {" + str + " } \n";
}
		