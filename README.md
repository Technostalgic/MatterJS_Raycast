# MatterJS_Raycast

This is a simple raycasting algorithm that is designed to work with <a href="https://github.com/liabru/">liabru</a>'s JavaScript based rigid body physics engine, <a href="https://github.com/liabru/matter-js">matter.js</a>.

### Purpose
I created this algorithm because the current build of matter.js has raycasting, but the raycast doesn't return any collision points, only the bodies that it collides with.
With this algorithm, I get the list of collided bodies and then test against each edge on the body for an intersection point and some other stuff to get more detailed information about the collision.

matter.js: <a href="https://github.com/liabru/matter-js/">https://github.com/liabru/matter-js/</a><br />
matter.js website: <a href="http://brm.io/matter-js/">http://brm.io/matter-js/</a><br />
