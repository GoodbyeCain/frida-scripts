/*
 * raptor_frida_android_enum.js - Java class/method enumerator
 * Copyright (c) 2017 Marco Ivaldi <raptor@0xdeadbeef.info>
 *
 * Frida.re JS functions to enumerate Java classes and methods 
 * declared in an iOS app. See https://www.frida.re/ and 
 * https://codeshare.frida.re/ for further information on this 
 * powerful tool.
 *
 * "We want to help others achieve interop through reverse
 * engineering" -- @oleavr
 *
 * Example usage:
 * # frida -U -f com.target.app -l raptor_frida_android_enum.js --no-pause
 *
 * Get the latest version at:
 * https://github.com/0xdea/frida-scripts/
 */

var Util = {};
Util.console = {

	// We try to be sensible of how much data we want to log here. Only the first
	// level of an Object or Array is parsed. All subsequent levels are ommited.
	// Arrays are shortened to the first 32 entries.
	// To log an Object and traverse all levels, use console.logJSON()
	_arrayMaxLength: 32,
	
	_toString: function(obj, deep) {
		if( deep ) {
			return JSON.stringify(obj);
		}
		else if( obj instanceof Array || ArrayBuffer.isView(obj) ) {
			var s = '',
				length = Math.min(obj.length, Util.console._arrayMaxLength),
				omitted = obj.length - length;
			for( var i = 0; i < length; i++ ) {
				s += (i === 0 ? '' : ', ') + Util.console._toStringFlat(obj[i]);
			}
			return '[' + s + (omitted ? ', ...'+omitted+' more]' : ']');
		}
		else {
			var s = '',
				first = true;
			for( var i in obj ) {
				s += (first ? '' : ', ') + i + ': ' + Util.console._toStringFlat(obj[i]);
				first = false;
			}
			return '{'+s+'}';
		}
	},
	
	_toStringFlat: function(obj) {
		if( typeof(obj) === 'function' ) {
			return '[Function]';
		}
		else if( obj instanceof Array || ArrayBuffer.isView(obj) ) {
			return '[Array '+obj.length+']';
		}
		else {
			return obj;
		}
	},
	
	_log: function(level, args, deep) {
		var s = level + ':';
		for (var i = 0; i < args.length; i++) {
			var arg = args[i];
			s += ' ' + (!arg || typeof(arg) !== 'object'
				? arg
				: Util.console._toString(arg, deep));
		}
		console.log( s );
	},
	
	assert: function() {
		var args = Array.prototype.slice.call(arguments);
		var assertion = args.shift();
		if( !assertion ) {
			console.log( 'Assertion failed: ' + args.join(', ') );
		}
	}
};

Util.log = function () { Util.console._log('LOG', arguments); };
Util.logJSON = function() {Util.console._log('JSON', arguments, true)};

// enumerate all Java classes
function enumAllClasses()
{
	var allClasses = [];
	var classes = Java.enumerateLoadedClassesSync();

	classes.forEach(function(aClass) {
		try {
			var className = aClass.match(/[L](.*);/)[1].replace(/\//g, ".");
		}
		catch(err) {} // avoid TypeError: cannot read property 1 of null
		allClasses.push(className);
	});

	return allClasses;
}

// find all Java classes that match a pattern
function findClasses(pattern)
{
	var allClasses = enumAllClasses();
	var foundClasses = [];

	allClasses.forEach(function(aClass) {
		try {
			if (aClass.match(pattern)) {
				foundClasses.push(aClass);
			}
		}
		catch(err) {} // avoid TypeError: cannot read property 'match' of undefined
	});

	return foundClasses;
}

// enumerate all methods declared in a Java class
function enumMethods(targetClass)
{
	var hook = Java.use(targetClass);
	var ownMethods = hook.class.getDeclaredMethods();
	hook.$dispose;

	return ownMethods;
}

// get ApplicationContext
function getApplicationContext() {
	const ActivityThread = Java.use("android.app.ActivityThread");
	const currentApplication = ActivityThread.currentApplication();

	var ret = currentApplication.getApplicationContext();
	return ret;
}

function getPackageInfo() {
	const context = getApplicationContext();
	const packageInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
	Util.log(packageInfo);
	return packageInfo;
}

/*
 * The following functions were not implemented because deemed impractical:
 *
 * enumAllMethods() - enumerate all methods declared in all Java classes
 * findMethods(pattern) - find all Java methods that match a pattern
 *
 * See raptor_frida_ios_enum.js for a couple of ObjC implementation examples.
 */

// usage examples
setTimeout(function() { // avoid java.lang.ClassNotFoundException

	Java.perform(function() {

		// enumerate all classes
		/*
		var a = enumAllClasses();
		a.forEach(function(s) { 
			console.log(s); 
		});
		*/

		// find classes that match a pattern
		/*
		var a = findClasses(/password/i);
		a.forEach(function(s) { 
			console.log(s); 
		});
		*/

		// enumerate all methods in a class
		/*
		var a = enumMethods("com.target.app.PasswordManager")
		a.forEach(function(s) { 
			console.log(s); 
		});
		*/

	});
}, 0);
