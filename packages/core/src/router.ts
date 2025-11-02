/**
 * High-performance Radix/Trie Router
 * O(path_length) lookup time with minimal allocations
 *
 * Supports:
 * - Static segments: /users/list
 * - Named params: /users/:id
 * - Wildcards: /files/*path
 */

import type { Handler, HTTPMethod, RouteMatch, RouteParams } from './types/index';

const enum NodeType {
  STATIC = 0,
  PARAM = 1,
  WILDCARD = 2,
}

interface RouterNode {
  type: NodeType;
  segment: string; // segment text (static) or param name
  handler?: Handler; // handler at this exact path
  children: RouterNode[]; // child nodes
  paramChild?: RouterNode; // single :param child (fast path)
  wildcardChild?: RouterNode; // single * child
}

export class Router {
  private roots = new Map<HTTPMethod, RouterNode>();

  /**
   * Register a route handler
   */
  add(method: HTTPMethod, path: string, handler: Handler): void {
    // Get or create root for this method
    let root = this.roots.get(method);
    if (!root) {
      root = this.createNode(NodeType.STATIC, '');
      this.roots.set(method, root);
    }

    // Parse path into segments
    const segments = this.parsePathSegments(path);

    // Insert into trie
    this.insertRoute(root, segments, 0, handler);
  }

  /**
   * Find matching handler for request
   */
  find(method: HTTPMethod, path: string): RouteMatch | null {
    const root = this.roots.get(method);
    if (!root) return null;

    const params: RouteParams = {};
    const segments = this.parsePathSegments(path);

    const handler = this.search(root, segments, 0, params);

    if (!handler) return null;

    return { handler, params };
  }

  /**
   * Parse path into segments, handling leading/trailing slashes
   */
  private parsePathSegments(path: string): string[] {
    // Remove leading and trailing slashes
    if (path.startsWith('/')) path = path.slice(1);
    if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1);

    // Empty path → root
    if (path === '') return [];

    return path.split('/');
  }

  /**
   * Create a new router node
   */
  private createNode(type: NodeType, segment: string): RouterNode {
    return {
      type,
      segment,
      children: [],
    };
  }

  /**
   * Insert route into trie recursively
   */
  private insertRoute(node: RouterNode, segments: string[], index: number, handler: Handler): void {
    // Base case: reached end of path
    if (index === segments.length) {
      node.handler = handler;
      return;
    }

    const segment = segments[index];
    if (!segment) return;
    const { type, name } = this.parseSegment(segment);

    // Find or create matching child
    let child: RouterNode | undefined;

    if (type === NodeType.PARAM) {
      // Param child (fast path)
      if (!node.paramChild) {
        node.paramChild = this.createNode(NodeType.PARAM, name);
      }
      child = node.paramChild;
    } else if (type === NodeType.WILDCARD) {
      // Wildcard child (must be last segment)
      if (index !== segments.length - 1) {
        throw new Error('Wildcard must be the last segment');
      }
      if (!node.wildcardChild) {
        node.wildcardChild = this.createNode(NodeType.WILDCARD, name);
      }
      child = node.wildcardChild;
    } else {
      // Static child
      child = node.children.find((c) => c.type === NodeType.STATIC && c.segment === segment);
      if (!child) {
        child = this.createNode(NodeType.STATIC, segment);
        node.children.push(child);
      }
    }

    // Recurse
    this.insertRoute(child, segments, index + 1, handler);
  }

  /**
   * Search for handler in trie
   * Priority: static > param > wildcard
   */
  private search(
    node: RouterNode,
    segments: string[],
    index: number,
    params: RouteParams
  ): Handler | null {
    // Base case: consumed all segments
    if (index === segments.length) {
      return node.handler || null;
    }

    const segment = segments[index];
    if (!segment) return null;

    // 1. Try static match first (highest priority)
    for (const child of node.children) {
      if (child.type === NodeType.STATIC && child.segment === segment) {
        const handler = this.search(child, segments, index + 1, params);
        if (handler) return handler;
      }
    }

    // 2. Try param match
    if (node.paramChild) {
      const paramName = node.paramChild.segment;
      params[paramName] = segment;
      const handler = this.search(node.paramChild, segments, index + 1, params);
      if (handler) return handler;
      // Backtrack param on failure
      delete params[paramName];
    }

    // 3. Try wildcard match (lowest priority, matches rest of path)
    if (node.wildcardChild) {
      const wildcardName = node.wildcardChild.segment;
      // Capture remaining path
      params[wildcardName] = segments.slice(index).join('/');
      return node.wildcardChild.handler || null;
    }

    return null;
  }

  /**
   * Parse segment to determine type and extract name
   */
  private parseSegment(segment: string): { type: NodeType; name: string } {
    if (segment.startsWith(':')) {
      return {
        type: NodeType.PARAM,
        name: segment.slice(1),
      };
    }

    if (segment === '*' || segment.startsWith('*')) {
      return {
        type: NodeType.WILDCARD,
        name: segment.slice(1) || 'wildcard',
      };
    }

    return {
      type: NodeType.STATIC,
      name: segment,
    };
  }
}
