/*jslint node: true, white: true, vars:true, plusplus: true */
/*global describe, it */

'use strict';

/**
 * implementaion of the Dijkstra's Algorithm
 *
 * http://fr.wikipedia.org/wiki/Algorithme_de_Dijkstra
 *
 */
var DEBUG_ENABLED = process.env.SHORTEST_WAY_DEBUG_ENABLED ? true : false;
/**************************************************
 * Model
 ***************************************************/

var debug = function ( message ) {
  if ( DEBUG_ENABLED ) {
    console.log( message );
  }
};

/**
 * one node of the path
 * @param data - the data that goes with this node.
 * @param data.raw - raw data of the object
 * @param data.id - identifier of the node
 * @param data.offset - optional extra weight that is added for each next node of this one
 * @param start {boolean} true if this is the start node
 */
function Node( data ) {
  /** does this not is the starting point: true -> start, flase -> end */

  /** a unique identifier of this node */
  this.id = data.id;

  /** offset for the weight when a next node is added */
  this.offset = data.offset || 0;

  /** the value that is use to compute the shortest path: distance, executing time */
  this.value = Number.MAX_VALUE;

  /** links to the next Node */
  this.next = {};

  this.toString = function () {
    return this.id + '[ ' + this.value + ' ]';
  };
}

module.exports = Node;

/**
 * Add a node
 * @param node {Node} node to add
 */
Node.prototype.addNext = function ( node, weight ) {
  weight = weight || 0;
  if ( weight < 0 ) {
    throw new Error( 'The weight must be greater or equal to zero' );
  }
  if ( this.next.hasOwnProperty( node.id ) ) {
    throw new Error( 'The node ' + node.id + ' was already added' );
  } else {
    this.next[ node.id ] = {
      node: node,
      weight: weight + this.offset
    };
  }
};

/**
 * add a transion to this node.
 *
 * A transition is a node that is the next node of this node by a weight of zero and
 * has a 'node' paramerer as a next node with the 'weight' parameter
 */
Node.prototype.addTransition = function ( node, weight, options ) {
	
	options = options || {};
	
	// build transition id
	var transitionId;
	if ( options.id ) {
		transitionId = options.id;
	} else if ( options.prefixId ) {
		transitionId = options.prefixId + ':' + this.id + '>' + weight + '>' + node.id;
	} else {
		transitionId = 'transition:' + this.id + '>' + weight + '>' + node.id;
	}

	// set startWeight
	var startWeight = options.startWeight || 0;
	
	// create the transition node
	var transition = new Node( {id: transitionId } );
	// add transition node as a next node of this node
	this.addNext( transition, startWeight );
	// setup next node of transition node as this node
	transition.addNext( node, weight );
	
	return transition;
};


/**
 * find the nearest node among all nodes of the graph
 * @param nodes {Array} arrays of Node
 */
function findNearest( nodes ) {
    debug( '\nfind nearest node amond all nodes: ' + nodes );
    var nearest, id;
    //for ( i = 0; i < nodes.length; i++ ) {
    for ( id in nodes ) {
      if ( nodes.hasOwnProperty( id ) ) {
        var node = nodes[ id ];
        if ( !nearest ) {
          nearest = node;
        } else if ( nearest.value > node.value ) {
          nearest = node;
        }
      }
    }

    debug( 'Nearest is: ' + nearest );

    return nearest;
  }
  /**
   * remove a node into a node list.
   *
   * We browse all nodes looking node whose identifier match.
   *
   * @param nodes {Array} array of nodes to remove
   * @param node {Object} node to remove.
   */
function removeNode( nodes, node ) {
    delete nodes[ node.id ];
    nodes.length = nodes.length - 1;
  }
  /**
   * update all next nodes of the node
   * - update the cumulative value
   * - update the predecessor
   * @param id {String} identifier of the next node
   * @param n1 {Object} node element
   */
function updateNextNode( id, n1 ) {
  var n2 = n1.next[ id ].node;
  var distance = n1.next[ id ].weight;

  debug( ' - next: ' + n2 + ' with distance: ' + distance );
  debug( '   n2.value > n1.value + distance ?' );

  if ( n2.value > n1.value + distance ) {
    debug( '   YES : ' + n2.value + ' > ' + n1.value + ' + ' + distance );
    n2.value = n1.value + distance;
    n2.prev = n1;
    debug( '   updating n2: ' + n2.toString() );
  } else {
    debug( '   NO  : ' + n2.value + ' > ' + n1.value + ' + ' + distance );
  }
}

/**
 * update all next nodes of the node
 * - update the cumulative value
 * - update the predecessor
 * @param n1 {Object} node element
 */
function updateNextNodes( n1 ) {
    debug( 'update next nodes: ' + n1 );
    var id;
    for ( id in n1.next ) {
      if ( n1.next.hasOwnProperty( id ) ) {
        updateNextNode( id, n1 );
      }
    }
  }
  /**
   * update all nodes: browse all nodes and update each distance and value
   * @param nodes {Array} array of nodes to update
   */
function updateAllNodes( nodes ) {
    debug( 'update all nodes: ' + nodes );
    while ( nodes.length > 0 ) {
      var n1 = findNearest( nodes );
      removeNode( nodes, n1 );
      updateNextNodes( n1 );
    }
  }
  /**
   * Compute the path between the starting node and the ending node
   */
function computePath( startingNode, endingNode ) {
  var path = [];
  var n = endingNode;
  while ( n && n.id !== startingNode.id ) {
    // insert at the beggining
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
    path.unshift( n );
    n = n.prev;
  }

  path.unshift( startingNode );

  return path;
}

/**
 * compute the shortest path from this starting node an ending node
 */
Node.prototype.compute = function ( endingNode, nodes ) {

  var startingNode = this;
  startingNode.value = 0;

  // if all nodes are stored in an array, we store them into an hash map (i.e. an object )
  // it is them easier and faster to remove nodes from this list
  if ( Array.isArray( nodes ) ) {
    var length = nodes.length;
    nodes = nodes.reduce( function ( prec, node, index, array ) {
      prec[ node.id ] = node;
      return prec;
    }, {} );
    nodes.length = length;
  }

  updateAllNodes( nodes );

  return computePath( startingNode, endingNode );

};
