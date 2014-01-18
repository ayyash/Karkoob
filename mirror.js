
function rtlMirror(text) {
	// put text in a stylesheet inside an iframe of its own to process
	var $sheet = $("<style rel='stylesheet' type='text/css' />").text(text).appendTo("body").prop("disabled",true);
	var sheet = $sheet.get(0).sheet;

	var str = "";
	for (var i = 0; i < sheet.cssRules.length; i++) {

		var rule = sheet.cssRules[i];

		switch (rule.type) {
			case 1:

				str += rtlMirrorRule(rule) + "\n";
				break;
			case 4: // media
				var mediastr = "";
				// if rtl just add to str
				if (rule.media.mediaText == "rtl") {
					for (var j = 0; j < rule.cssRules.length; j++) {
						str += rule.cssRules[j].cssText + "\n";
					}

				} else {
					for (var j = 0; j < rule.cssRules.length; j++) {
						mediastr += "\n" + rtlMirrorRule(rule.cssRules[j]) + "\n";
					}
				}
				if (mediastr != "") {
					str += "\n@media " + rule.media.mediaText + " { ";
					str += mediastr;
					str += "\n}";
				}

				break;
			case 5: // fontface
				str += "\n" + rule.cssText + "\n";
				break;
			default:
				continue;
		}



	}
	// lets remove the stylehseet
	$sheet.remove();
	return str;

}

var compactStyle = ["padding", "margin", "border-width", "border-style", "border-color"];

function rtlMirrorRule(rule) {

	// TODO: check 1:
	// 1. right and left in cssText
	// 2. compact forms (or simply always use exact forms, though that would make the css file bigger) [padding margin border]
	// 3. content should be encapsulated with quotes

	// check the existence of right or left in css text
	var cssText = rule.cssText;

	// if "content" is part of definition, encapsulate
	if (cssText.indexOf("content") > -1) {
		cssText = cssText.replace(/\\\\/gi, "\\");
	}

	//if (cssText.indexOf("left") < 0 && cssText.indexOf("right") < 0) return cssText.replace(/(::)/gi, ":");

	// reconstruct cssText, start from selectorText
	var str = cssText.substring(rule.selectorText.length)
					.replace(/left/gi, "tempr").replace(/right/gi, "left").replace(/tempr/gi, "right");

	str = "\n" + rule.selectorText.replace(/(::)/gi, ":") + str + " \n";


	var rtl = "";

	for (var i = 0; i < compactStyle.length; i++) {
		if (cssText.indexOf(compactStyle[i] + ":") > -1) {
			// overwriters
			rtl += rtlCompact(rule, compactStyle[i]);
		}
	}

	// remove :: from selector text, this is rtl compact overwrites
	if (rtl != "") rtl = "\n" + rule.selectorText.replace(/(::)/gi, ":") + "{" + rtl + " } \n";


	return str + rtl;
}

function rtlCompact(rule, ow) {

	var str = "";
	// just overright left and right, this is to take care of compact forms which have right and left always

	// get all padding-left, margin-left, border-left-width, border-left-style, border-left-color
	// if border, insert left in the middle
	var propName = ow + "-{0}";
	if (ow == "border-style") propName = "border-{0}-style";
	if (ow == "border-width") propName = "border-{0}-width";
	if (ow == "border-color") propName = "border-{0}-color";

	var leftPropName = propName.replace("{0}", "left"),
		rightPropName = propName.replace("{0}", "right"),
		propPro = (rule.style.getPropertyPriority(leftPropName) != "" ? "!important" : ""), // i think if one is important both are
		leftValue = rule.style.getPropertyValue(leftPropName),
		rightValue = rule.style.getPropertyValue(rightPropName);

	if (leftValue == rightValue) return "";

	//right: left value and left priority
	str += rightPropName + ":" + leftValue + propPro + ";\n";


	// left: right value and right priority if it exists
	str += leftPropName + ":" + rightValue + propPro + ";\n";


	// remove :: from selector text

	return str;
}