/*jslint node: true, white: true, vars:true, plusplus: true */
/*global describe, it */

'use strict';

// TODO coverage

var Node = require( '../lib/Node' );
var assert = require( 'chai' ).assert;

var assetIsSet = function ( results, expectedLength ) {
	assert.isDefined( results );
	assert.isNotNull( results );
	assert.isArray( results );
	assert.lengthOf( results, expectedLength );
};


describe( 'Node Wiki', function () {

	it( 'shoud compte a graph with a 4 nodes graph with all nodes connected each other', function () {
		
		var a = new Node( { id: 'A' }, true );		
		var b = new Node( { id: 'B' } );
		var c = new Node( { id: 'C' } );
		var d = new Node( { id: 'D' } );
		var e = new Node( { id: 'E' } );
		var f = new Node( { id: 'F' } );
		var g = new Node( { id: 'G' } );
		var h = new Node( { id: 'H' } );
		var i = new Node( { id: 'I' } );
		var j = new Node( { id: 'J' } );

		a.addNext( b, 85 );
		a.addNext( c, 217 );
		a.addNext( e, 173 );
		
		b.addNext( f, 80 );
		
		c.addNext( g, 186 );
		c.addNext( h, 103 );
		
		h.addNext( d, 183 );
		
		f.addNext( i, 250 );
		i.addNext( j, 84 );
		
		h.addNext( j, 167 );
		e.addNext( j, 502 );
		
		// call
		var allNodes = [ a, b, c, d, e, f, g, h, i, j ];
		var results = a.compute( j, allNodes );
		
		// assertions
		assetIsSet( results, 4 );
		//console.log( results );
		assert.equal( results[0].id, 'A' );
		assert.equal( results[1].id, 'C' );
		assert.equal( results[2].id, 'H' );
		assert.equal( results[3].id, 'J' );
		
		
		var path = results.map( function ( node ) {
			return node.id
		} ).join( ', ' );
		
		//console.log( path );
		assert.equal( path, 'A, C, H, J' );
		
		
		
//		results.forEach( function ( node ) {
//			delete node.next;
//			delete node.prev;
//		} );
//		results.forEach( function ( node ) {
//			node.next = Object.keys( node.next );
//			node.prev = node.prev ? node.prev.id : undefined;
//		} );
//		
//		console.log( JSON.stringify( results ) );
		
	} );
	
} );


/*

function describe( text, callback ) {
	console.log( text );
	callback();
}
function done( err ) {
	if ( err ) {
		console.error( 'FAILURE ');
		console.error( err );
	} else {
		console.log( 'SUCCESS' );
	}
}
function it( text, callback ) {
	console.log( '  ' + text );
	callback( done );
}
function iit() {}

*/
