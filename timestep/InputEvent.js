"use import";
/**

This class represents an input event.

It assumes a tree structure of View objects.  The top (root) of the
tree is typically the main Application view.  

Events are assigned a root and a target.  View::dispatchEvent
computes the root and target from the event location (x, y).

Propogation has two phases: capturing and bubbling.  Users 
can mostly ignore capturing as the primary hooks are in the 
bubbling.  Bubbling is defined as calling event handlers on
each view starting with 'target' and then continuing up 
superView pointers until reaching 'root'.  Views can listen
to the event bubbling by adding methods such as:
 "input:start" -> "function onInputStart(evt)"
 "input:drag" -> "function onDrag(dragEvt, moveEvt, delta)" *

Other code can hook into a view's events by calling:
  myView.subscribe('input:start', function() { alert('Mouse Down'); });
  myView.subscribe('input:end', this, 'onChildViewClick');

Propogation of events can be cancelled by calling evt.cancel().

* Note that onDrag is a special event that receives not only
  a move event from an 'input:move' event, but also a custom
  dragEvt object that contains extra data such as the start
  position of the drag.

**/

import math2D.Point as Point;

var InputEvent = exports = Class(function() {
	this.cancelled = false; // If true, this event will not propogate
	this.depth = 0; // Number of levels of the tree from root to target (inclusive)
	
	// Note that under normal usage:
	//   this.depth == this.trace.length
	//   this.root = this.trace[this.trace.length - 1]
	//   this.target = this.trace[0]
	
	this.init = function(evtType, pt, root, target) {
		// string evtType, e.g. 'input:start'
		this.type = evtType;
		
		// localized point coordinates, indexed by a view's uid (View::uid)
		this.pt = {};
		
		// raw (x, y) coordinates
		this.srcPt = new Point(pt);
		
		// list of View nodes from target to root
		this.trace = [];
		
		// Top-most view where event is dispatched (e.g. the tree root)
		this.root = root || null;
		
		// Bottom-most view where the event occurred
		this.target = target || null;
	}
	
	this.cancel = function() {
		this.cancelled = true;
	}
});

