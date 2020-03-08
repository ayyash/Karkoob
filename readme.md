

## Mirror Css to RTL

Write css in an LTR fashion, then use this exported function to automatically mirror the rights and lefts. You will have to add extra fine tuning styles that do not get processed for the wrath of CSS: `background-position` is one of them.

This function takes the css as text, reflects properties of right, and left, and swaps combined properties like shortcut padding and margins. It does not reflect selector names, so a class name `.right` remains so. This means in your css and in your html, you always style for LTR, no if conditions to reflect.

Anything found between the RTL BEGIN and RTL END is ignored:

```
/* RTL BEGIN */
.donotreflect {
    padding-left: 10px;
}
/* RTL END */
```

**The output** The file generated is a whole css replacement, not a patch file. From years of experience, generating a seperate file for rtl is much less bugy and more maintainable than adding a patch file. Keep that in mind. 

#### Notes:
The file `mirror.js` is legacy, parses cssText directly, which was a very buggy process, use `rtl.js`

### Use test file

`Index.htm` is a basic html file that lets you test your css, run it locally to see the output.