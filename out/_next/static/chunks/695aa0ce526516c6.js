(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,25661,(e,t,i)=>{"use strict";var n=e.r(44440),r="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},s=n.useState,a=n.useEffect,o=n.useLayoutEffect,l=n.useDebugValue;function c(e){var t=e.getSnapshot;e=e.value;try{var i=t();return!r(e,i)}catch(e){return!0}}var d="u"<typeof window||void 0===window.document||void 0===window.document.createElement?function(e,t){return t()}:function(e,t){var i=t(),n=s({inst:{value:i,getSnapshot:t}}),r=n[0].inst,d=n[1];return o(function(){r.value=i,r.getSnapshot=t,c(r)&&d({inst:r})},[e,i,t]),a(function(){return c(r)&&d({inst:r}),e(function(){c(r)&&d({inst:r})})},[e]),l(i),i};i.useSyncExternalStore=void 0!==n.useSyncExternalStore?n.useSyncExternalStore:d},56032,(e,t,i)=>{"use strict";t.exports=e.r(25661)},20206,(e,t,i)=>{"use strict";var n=e.r(44440),r=e.r(56032),s="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},a=r.useSyncExternalStore,o=n.useRef,l=n.useEffect,c=n.useMemo,d=n.useDebugValue;i.useSyncExternalStoreWithSelector=function(e,t,i,n,r){var u=o(null);if(null===u.current){var f={hasValue:!1,value:null};u.current=f}else f=u.current;var m=a(e,(u=c(function(){function e(e){if(!l){if(l=!0,a=e,e=n(e),void 0!==r&&f.hasValue){var t=f.value;if(r(t,e))return o=t}return o=e}if(t=o,s(a,e))return t;var i=n(e);return void 0!==r&&r(t,i)?(a=e,t):(a=e,o=i)}var a,o,l=!1,c=void 0===i?null:i;return[function(){return e(t())},null===c?void 0:function(){return e(c())}]},[t,i,n,r]))[0],u[1]);return l(function(){f.hasValue=!0,f.value=m},[m]),d(m),m}},96482,(e,t,i)=>{"use strict";t.exports=e.r(20206)},79561,e=>{"use strict";let t,i;var n,r,s,a,o=e.i(87433),l=e.i(25810),c=e.i(12931),d=e.i(9186),u=e.i(11334),f=e.i(44440),m=e.i(3626),h=e.i(48683),p=e.i(31352),v=m;let x=parseInt(m.REVISION.replace(/\D+/g,"")),g=(n={cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new m.Color,sectionColor:new m.Color,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new m.Vector3,worldPlanePosition:new m.Vector3},r=`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,s=`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;
    uniform float cellThickness;
    uniform float sectionThickness;

    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      float line = min(grid.x, grid.y) + 1.0 - thickness;
      return 1.0 - min(line, 1.0);
    }

    void main() {
      float g1 = getGrid(cellSize, cellThickness);
      float g2 = getGrid(sectionSize, sectionThickness);

      vec3 from = worldCamProjPosition*vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

      gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));
      gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);
      if (gl_FragColor.a <= 0.0) discard;

      #include <tonemapping_fragment>
      #include <${x>=154?"colorspace_fragment":"encodings_fragment"}>
    }
  `,(a=class extends v.ShaderMaterial{constructor(e){for(const t in super({vertexShader:r,fragmentShader:s,...e}),n)this.uniforms[t]=new v.Uniform(n[t]),Object.defineProperty(this,t,{get(){return this.uniforms[t].value},set(e){this.uniforms[t].value=e}});this.uniforms=v.UniformsUtils.clone(this.uniforms)}}).key=v.MathUtils.generateUUID(),a),y=f.forwardRef(({args:e,cellColor:t="#000000",sectionColor:i="#2080ff",cellSize:n=.5,sectionSize:r=1,followCamera:s=!1,infiniteGrid:a=!1,fadeDistance:o=100,fadeStrength:l=1,fadeFrom:c=1,cellThickness:d=.5,sectionThickness:v=1,side:x=m.BackSide,...y},w)=>{(0,h.extend)({GridMaterial:g});let S=f.useRef(null);f.useImperativeHandle(w,()=>S.current,[]);let b=new m.Plane,j=new m.Vector3(0,1,0),E=new m.Vector3(0,0,0);return(0,p.useFrame)(e=>{b.setFromNormalAndCoplanarPoint(j,E).applyMatrix4(S.current.matrixWorld);let t=S.current.material,i=t.uniforms.worldCamProjPosition,n=t.uniforms.worldPlanePosition;b.projectPoint(e.camera.position,i.value),n.value.set(0,0,0).applyMatrix4(S.current.matrixWorld)}),f.createElement("mesh",(0,u.default)({ref:S,frustumCulled:!1},y),f.createElement("gridMaterial",(0,u.default)({transparent:!0,"extensions-derivatives":!0,side:x},{cellSize:n,sectionSize:r,cellColor:t,sectionColor:i,cellThickness:d,sectionThickness:v},{fadeDistance:o,fadeStrength:l,fadeFrom:c,infiniteGrid:a,followCamera:s})),f.createElement("planeGeometry",{args:e}))});function w({position:e,height:t=2,color:i="#4A90E2",delay:n=0,onComplete:r}){let s=(0,f.useRef)(null),a=(0,f.useRef)(0),l=(0,f.useRef)(null),c=(0,f.useRef)(!1);return(0,p.useFrame)(i=>{if(!s.current)return;let o=i.clock.getElapsedTime();null===l.current&&(l.current=o);let d=o-l.current-n;if(d<0){s.current.scale.y=0;return}a.current=Math.min(d/1.5,1);let u=1-Math.pow(1-a.current,3);if(s.current.scale.y=u,s.current.position.y=e[1]+t/2*u,a.current>.9&&a.current<1){let e=.05*Math.sin((a.current-.9)/.1*Math.PI);s.current.scale.y=u+e}a.current>=1&&!c.current&&(c.current=!0,r?.())}),(0,o.jsxs)("mesh",{ref:s,position:e,castShadow:!0,receiveShadow:!0,children:[(0,o.jsx)("boxGeometry",{args:[.8,t,.8]}),(0,o.jsx)("meshStandardMaterial",{color:i,emissive:i,emissiveIntensity:.2})]})}var S=e.i(10278),b=m,j=m;let E=new j.Box3,M=new j.Vector3;class C extends j.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry",this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute("position",new j.Float32BufferAttribute([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute("uv",new j.Float32BufferAttribute([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return void 0!==t&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),null!==this.boundingBox&&this.computeBoundingBox(),null!==this.boundingSphere&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new j.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new j.InterleavedBufferAttribute(i,3,0)),this.setAttribute("instanceEnd",new j.InterleavedBufferAttribute(i,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let i;e instanceof Float32Array?i=e:Array.isArray(e)&&(i=new Float32Array(e));let n=new j.InstancedInterleavedBuffer(i,2*t,1);return this.setAttribute("instanceColorStart",new j.InterleavedBufferAttribute(n,t,0)),this.setAttribute("instanceColorEnd",new j.InterleavedBufferAttribute(n,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new j.WireframeGeometry(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){null===this.boundingBox&&(this.boundingBox=new j.Box3);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;void 0!==e&&void 0!==t&&(this.boundingBox.setFromBufferAttribute(e),E.setFromBufferAttribute(t),this.boundingBox.union(E))}computeBoundingSphere(){null===this.boundingSphere&&(this.boundingSphere=new j.Sphere),null===this.boundingBox&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(void 0!==e&&void 0!==t){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let n=0;for(let r=0,s=e.count;r<s;r++)M.fromBufferAttribute(e,r),n=Math.max(n,i.distanceToSquared(M)),M.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(M));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}var _=m,A=e.i(77863),z=e.i(30438);class P extends _.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:_.UniformsUtils.clone(_.UniformsUtils.merge([A.UniformsLib.common,A.UniformsLib.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new _.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${z.version>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(e){!0===e?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(e){!!e!="USE_DASH"in this.defines&&(this.needsUpdate=!0),!0===e?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(e){!!e!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),!0===e?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}let L=z.version>=125?"uv1":"uv2",U=new b.Vector4,B=new b.Vector3,N=new b.Vector3,D=new b.Vector4,O=new b.Vector4,R=new b.Vector4,T=new b.Vector3,I=new b.Matrix4,F=new b.Line3,V=new b.Vector3,k=new b.Box3,G=new b.Sphere,H=new b.Vector4;function W(e,t,n){return H.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),H.multiplyScalar(1/H.w),H.x=i/n.width,H.y=i/n.height,H.applyMatrix4(e.projectionMatrixInverse),H.multiplyScalar(1/H.w),Math.abs(Math.max(H.x,H.y))}class q extends b.Mesh{constructor(e=new C,t=new P({color:0xffffff*Math.random()})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,n=new Float32Array(2*t.count);for(let e=0,r=0,s=t.count;e<s;e++,r+=2)B.fromBufferAttribute(t,e),N.fromBufferAttribute(i,e),n[r]=0===r?0:n[r-1],n[r+1]=n[r]+B.distanceTo(N);let r=new b.InstancedInterleavedBuffer(n,2,1);return e.setAttribute("instanceDistanceStart",new b.InterleavedBufferAttribute(r,1,0)),e.setAttribute("instanceDistanceEnd",new b.InterleavedBufferAttribute(r,1,1)),this}raycast(e,n){let r,s,a=this.material.worldUnits,o=e.camera;null!==o||a||console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');let l=void 0!==e.params.Line2&&e.params.Line2.threshold||0;t=e.ray;let c=this.matrixWorld,d=this.geometry,u=this.material;if(i=u.linewidth+l,null===d.boundingSphere&&d.computeBoundingSphere(),G.copy(d.boundingSphere).applyMatrix4(c),a)r=.5*i;else{let e=Math.max(o.near,G.distanceToPoint(t.origin));r=W(o,e,u.resolution)}if(G.radius+=r,!1!==t.intersectsSphere(G)){if(null===d.boundingBox&&d.computeBoundingBox(),k.copy(d.boundingBox).applyMatrix4(c),a)s=.5*i;else{let e=Math.max(o.near,k.distanceToPoint(t.origin));s=W(o,e,u.resolution)}k.expandByScalar(s),!1!==t.intersectsBox(k)&&(a?function(e,n){let r=e.matrixWorld,s=e.geometry,a=s.attributes.instanceStart,o=s.attributes.instanceEnd,l=Math.min(s.instanceCount,a.count);for(let s=0;s<l;s++){F.start.fromBufferAttribute(a,s),F.end.fromBufferAttribute(o,s),F.applyMatrix4(r);let l=new b.Vector3,c=new b.Vector3;t.distanceSqToSegment(F.start,F.end,c,l),c.distanceTo(l)<.5*i&&n.push({point:c,pointOnLine:l,distance:t.origin.distanceTo(c),object:e,face:null,faceIndex:s,uv:null,[L]:null})}}(this,n):function(e,n,r){let s=n.projectionMatrix,a=e.material.resolution,o=e.matrixWorld,l=e.geometry,c=l.attributes.instanceStart,d=l.attributes.instanceEnd,u=Math.min(l.instanceCount,c.count),f=-n.near;t.at(1,R),R.w=1,R.applyMatrix4(n.matrixWorldInverse),R.applyMatrix4(s),R.multiplyScalar(1/R.w),R.x*=a.x/2,R.y*=a.y/2,R.z=0,T.copy(R),I.multiplyMatrices(n.matrixWorldInverse,o);for(let n=0;n<u;n++){if(D.fromBufferAttribute(c,n),O.fromBufferAttribute(d,n),D.w=1,O.w=1,D.applyMatrix4(I),O.applyMatrix4(I),D.z>f&&O.z>f)continue;if(D.z>f){let e=D.z-O.z,t=(D.z-f)/e;D.lerp(O,t)}else if(O.z>f){let e=O.z-D.z,t=(O.z-f)/e;O.lerp(D,t)}D.applyMatrix4(s),O.applyMatrix4(s),D.multiplyScalar(1/D.w),O.multiplyScalar(1/O.w),D.x*=a.x/2,D.y*=a.y/2,O.x*=a.x/2,O.y*=a.y/2,F.start.copy(D),F.start.z=0,F.end.copy(O),F.end.z=0;let l=F.closestPointToPointParameter(T,!0);F.at(l,V);let u=b.MathUtils.lerp(D.z,O.z,l),m=u>=-1&&u<=1,h=T.distanceTo(V)<.5*i;if(m&&h){F.start.fromBufferAttribute(c,n),F.end.fromBufferAttribute(d,n),F.start.applyMatrix4(o),F.end.applyMatrix4(o);let i=new b.Vector3,s=new b.Vector3;t.distanceSqToSegment(F.start,F.end,s,i),r.push({point:s,pointOnLine:i,distance:t.origin.distanceTo(s),object:e,face:null,faceIndex:n,uv:null,[L]:null})}}}(this,o,n))}}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(U),this.material.uniforms.resolution.value.set(U.z,U.w))}}class $ extends C{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,i=new Float32Array(2*t);for(let n=0;n<t;n+=3)i[2*n]=e[n],i[2*n+1]=e[n+1],i[2*n+2]=e[n+2],i[2*n+3]=e[n+3],i[2*n+4]=e[n+4],i[2*n+5]=e[n+5];return super.setPositions(i),this}setColors(e,t=3){let i=e.length-t,n=new Float32Array(2*i);if(3===t)for(let r=0;r<i;r+=t)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];else for(let r=0;r<i;r+=t)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5],n[2*r+6]=e[r+6],n[2*r+7]=e[r+7];return super.setColors(n,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class K extends q{constructor(e=new $,t=new P({color:0xffffff*Math.random()})){super(e,t),this.isLine2=!0,this.type="Line2"}}let J=f.forwardRef(function({points:e,color:t=0xffffff,vertexColors:i,linewidth:n,lineWidth:r,segments:s,dashed:a,...o},l){var c,d;let h=(0,S.useThree)(e=>e.size),p=f.useMemo(()=>s?new q:new K,[s]),[v]=f.useState(()=>new P),x=(null==i||null==(c=i[0])?void 0:c.length)===4?4:3,g=f.useMemo(()=>{let n=s?new C:new $,r=e.map(e=>{let t=Array.isArray(e);return e instanceof m.Vector3||e instanceof m.Vector4?[e.x,e.y,e.z]:e instanceof m.Vector2?[e.x,e.y,0]:t&&3===e.length?[e[0],e[1],e[2]]:t&&2===e.length?[e[0],e[1],0]:e});if(n.setPositions(r.flat()),i){t=0xffffff;let e=i.map(e=>e instanceof m.Color?e.toArray():e);n.setColors(e.flat(),x)}return n},[e,s,i,x]);return f.useLayoutEffect(()=>{p.computeLineDistances()},[e,p]),f.useLayoutEffect(()=>{a?v.defines.USE_DASH="":delete v.defines.USE_DASH,v.needsUpdate=!0},[a,v]),f.useEffect(()=>()=>{g.dispose(),v.dispose()},[g]),f.createElement("primitive",(0,u.default)({object:p,ref:l},o),f.createElement("primitive",{object:g,attach:"geometry"}),f.createElement("primitive",(0,u.default)({object:v,attach:"material",color:t,vertexColors:!!i,resolution:[h.width,h.height],linewidth:null!=(d=null!=n?n:r)?d:1,dashed:a,transparent:4===x},o)))}),X=f.forwardRef(({args:e,children:t,...i},n)=>{let r=f.useRef(null);return f.useImperativeHandle(n,()=>r.current),f.useLayoutEffect(()=>void 0),f.createElement("mesh",(0,u.default)({ref:r},i),f.createElement("sphereGeometry",{attach:"geometry",args:e}),t)});function Q({points:e,color:t="#FF6B35",delay:i=0,onComplete:n}){let r=(0,f.useRef)(0),s=(0,f.useRef)(null),a=(0,f.useRef)(!1),l=(0,f.useRef)([]),c=(0,f.useMemo)(()=>e.map(e=>new m.Vector3(e[0],e[1],e[2])),[e]),d=(0,f.useMemo)(()=>{let t=Math.max(2,Math.floor(e.length/3));return Array.from({length:t},(i,n)=>Math.floor((e.length-1)*n/(t-1)))},[e]);(0,p.useFrame)(e=>{let t=e.clock.getElapsedTime();null===s.current&&(s.current=t);let o=t-s.current-i;if(o<0){l.current=[];return}r.current=Math.min(o/2,1);let d=Math.floor((r.current<.5?2*r.current*r.current:1-Math.pow(-2*r.current+2,2)/2)*c.length);l.current=c.slice(0,d),r.current>=1&&!a.current&&(a.current=!0,n?.())});let u=r.current;return(0,o.jsxs)("group",{children:[l.current.length>1&&(0,o.jsx)(J,{points:l.current,color:t,lineWidth:3}),d.map((i,n)=>{let r=i/(e.length-1),s=e[i];if(!(u>r))return null;let a=Math.min((u-r)*6,1);return(0,o.jsx)(X,{args:[.15,16,16],position:s,scale:a,children:(0,o.jsx)("meshStandardMaterial",{color:t,emissive:t,emissiveIntensity:.5})},n)})]})}function Y({position:e,size:t=2,delay:i=0,onComplete:n}){let r=(0,f.useRef)(null),s=(0,f.useRef)(0),a=(0,f.useRef)(null),l=(0,f.useRef)(!1),c=(0,f.useMemo)(()=>Array.from({length:12},(e,i)=>{let n=i/12*Math.PI*2,r=.3*t;return{x:Math.cos(n)*r,z:Math.sin(n)*r,delay:.05*i,size:.3+.2*Math.random()}}),[t]);return(0,p.useFrame)(e=>{if(!r.current)return;let t=e.clock.getElapsedTime();null===a.current&&(a.current=t);let o=t-a.current-i;if(o<0)return void r.current.scale.setScalar(0);s.current=Math.min(o/1.8,1);let c=1-Math.pow(1-s.current,2);if(r.current.scale.setScalar(c),s.current>.8){let e=.02*Math.sin(2*t)+1;r.current.scale.setScalar(c*e)}s.current>=1&&!l.current&&(l.current=!0,n?.())}),(0,o.jsxs)("group",{ref:r,position:e,children:[(0,o.jsxs)("mesh",{position:[0,.01,0],receiveShadow:!0,children:[(0,o.jsx)("cylinderGeometry",{args:[t,t,.05,32]}),(0,o.jsx)("meshStandardMaterial",{color:"#2ECC71",roughness:.8})]}),c.map((e,i)=>{let n=Math.min(1.5*Math.max(0,s.current-e.delay),1);return(0,o.jsxs)("mesh",{position:[e.x,.02,e.z],scale:n,receiveShadow:!0,children:[(0,o.jsx)("cylinderGeometry",{args:[t*e.size,t*e.size,.03,16]}),(0,o.jsx)("meshStandardMaterial",{color:"#27AE60",roughness:.9})]},i)}),[0,1,2].map(e=>{let i=e/3*Math.PI*2,n=.5*t,r=Math.min(2*Math.max(0,s.current-.3-.1*e),1);return(0,o.jsxs)("group",{position:[Math.cos(i)*n,0,Math.sin(i)*n],scale:r,children:[(0,o.jsxs)("mesh",{position:[0,.15,0],castShadow:!0,children:[(0,o.jsx)("cylinderGeometry",{args:[.05,.05,.3,8]}),(0,o.jsx)("meshStandardMaterial",{color:"#8B4513"})]}),(0,o.jsxs)("mesh",{position:[0,.4,0],castShadow:!0,children:[(0,o.jsx)("sphereGeometry",{args:[.2,12,12]}),(0,o.jsx)("meshStandardMaterial",{color:"#228B22"})]})]},`tree-${e}`)})]})}function Z({taxRate:e,availableFunding:t,onSpawnComplete:i}){let[n,r]=(0,f.useState)([]),s=(0,f.useCallback)(()=>{let i={housing:50,school:80,"mental-health":30,subway:500,park:10},n=[],r=t,s=0;for(let t of e>50?["housing","mental-health","park","school","subway"]:["subway","school","park","housing","mental-health"]){let e=i[t],a=Math.floor(r/e);for(let i=0;i<Math.min(a,3);i++){let i=(Math.random()-.5)*8,a=(Math.random()-.5)*8;n.push({id:`${t}-${s++}`,type:t,position:[i,0,a],data:"subway"===t?{points:function(e){let t=[e],[i,n,r]=e,s=5+Math.floor(3*Math.random());for(let e=0;e<s;e++)t.push([i+=(Math.random()-.5)*2+1,n,r+=(Math.random()-.5)*2]);return t}([i,0,a])}:void 0}),r-=e}}return n},[e,t]),a=(0,f.useCallback)(()=>{r(s())},[s]);return(0,f.useState)(()=>{t>0&&a()}),(0,o.jsx)(o.Fragment,{children:n.map((e,t)=>{let n=.3*t;switch(e.type){case"housing":return(0,o.jsx)(w,{position:e.position,height:2+Math.random(),color:"#3498DB",delay:n,onComplete:()=>i?.(e)},e.id);case"school":return(0,o.jsx)(w,{position:e.position,height:1.5,color:"#F39C12",delay:n,onComplete:()=>i?.(e)},e.id);case"mental-health":return(0,o.jsx)(w,{position:e.position,height:1,color:"#9B59B6",delay:n,onComplete:()=>i?.(e)},e.id);case"subway":return(0,o.jsx)(Q,{points:e.data?.points||[],color:"#E74C3C",delay:n,onComplete:()=>i?.(e)},e.id);case"park":return(0,o.jsx)(Y,{position:e.position,size:1.5+.5*Math.random(),delay:n,onComplete:()=>i?.(e)},e.id);default:return null}})})}function ee(){let[e,t]=(0,f.useState)(50),[i,n]=(0,f.useState)(0),[r,s]=(0,f.useState)(0),[a,u]=(0,f.useState)(!1);return(0,o.jsxs)("div",{className:"w-full h-screen bg-gray-900",children:[(0,o.jsxs)("div",{className:"absolute top-4 left-4 z-10 bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-md",children:[(0,o.jsx)("h1",{className:"text-2xl font-bold mb-4",children:"SimCity-Style Animations"}),(0,o.jsxs)("div",{className:"space-y-4",children:[(0,o.jsxs)("div",{children:[(0,o.jsxs)("label",{className:"block text-sm font-medium mb-2",children:["Tax Rate: ",e,"%"]}),(0,o.jsx)("input",{type:"range",min:"0",max:"100",value:e,onChange:e=>t(Number(e.target.value)),className:"w-full",disabled:a}),(0,o.jsx)("p",{className:"text-xs text-gray-400 mt-1",children:e>50?"Focus: Social programs":"Focus: Infrastructure"})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("label",{className:"block text-sm font-medium mb-2",children:"Available Funding"}),(0,o.jsxs)("div",{className:"text-2xl font-bold text-green-400",children:["$",(i/1e3).toFixed(1),"B"]})]}),(0,o.jsx)("div",{className:"bg-gray-700 p-3 rounded",children:(0,o.jsxs)("div",{className:"text-sm",children:[(0,o.jsxs)("div",{className:"flex justify-between mb-1",children:[(0,o.jsx)("span",{children:"Improvements Spawned:"}),(0,o.jsx)("span",{className:"font-bold",children:r})]}),(0,o.jsxs)("div",{className:"flex justify-between",children:[(0,o.jsx)("span",{children:"Status:"}),(0,o.jsx)("span",{className:`font-bold ${a?"text-yellow-400":"text-gray-400"}`,children:a?"Building...":"Ready"})]})]})}),(0,o.jsxs)("div",{className:"flex gap-2",children:[(0,o.jsx)("button",{onClick:()=>{n(1e3+20*e),s(0),u(!0),setTimeout(()=>u(!1),8e3)},disabled:a,className:"flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-medium transition-colors",children:a?"Building...":"Build City"}),(0,o.jsx)("button",{onClick:()=>{n(0),s(0),u(!1)},className:"px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition-colors",children:"Reset"})]})]}),(0,o.jsxs)("div",{className:"mt-6 pt-4 border-t border-gray-700",children:[(0,o.jsx)("h3",{className:"text-sm font-semibold mb-3",children:"Improvement Types"}),(0,o.jsxs)("div",{className:"space-y-2 text-xs",children:[(0,o.jsxs)("div",{className:"flex items-center gap-2",children:[(0,o.jsx)("div",{className:"w-4 h-4 bg-blue-500 rounded"}),(0,o.jsx)("span",{children:"Affordable Housing"})]}),(0,o.jsxs)("div",{className:"flex items-center gap-2",children:[(0,o.jsx)("div",{className:"w-4 h-4 bg-orange-500 rounded"}),(0,o.jsx)("span",{children:"Schools"})]}),(0,o.jsxs)("div",{className:"flex items-center gap-2",children:[(0,o.jsx)("div",{className:"w-4 h-4 bg-purple-500 rounded"}),(0,o.jsx)("span",{children:"Mental Health Facilities"})]}),(0,o.jsxs)("div",{className:"flex items-center gap-2",children:[(0,o.jsx)("div",{className:"w-4 h-4 bg-red-500 rounded"}),(0,o.jsx)("span",{children:"Subway Lines"})]}),(0,o.jsxs)("div",{className:"flex items-center gap-2",children:[(0,o.jsx)("div",{className:"w-4 h-4 bg-green-500 rounded"}),(0,o.jsx)("span",{children:"Parks & Recreation"})]})]})]}),(0,o.jsxs)("div",{className:"mt-6 pt-4 border-t border-gray-700",children:[(0,o.jsx)("h3",{className:"text-sm font-semibold mb-2",children:"Instructions"}),(0,o.jsxs)("ul",{className:"text-xs text-gray-400 space-y-1 list-disc list-inside",children:[(0,o.jsx)("li",{children:"Adjust tax rate to change priorities"}),(0,o.jsx)("li",{children:'Click "Build City" to spawn improvements'}),(0,o.jsx)("li",{children:"Drag to rotate, scroll to zoom"}),(0,o.jsx)("li",{children:"Watch animations unfold in sequence"})]})]})]}),(0,o.jsxs)("div",{className:"absolute top-4 right-4 z-10 bg-gray-800 p-4 rounded-lg shadow-lg text-white",children:[(0,o.jsx)("h3",{className:"text-sm font-semibold mb-2",children:"Performance"}),(0,o.jsxs)("div",{className:"text-xs text-gray-400",children:[(0,o.jsx)("div",{children:"Target: 60 FPS"}),(0,o.jsx)("div",{className:"text-green-400",children:"Mobile-optimized ✓"})]})]}),(0,o.jsxs)(l.Canvas,{shadows:!0,children:[(0,o.jsx)(d.PerspectiveCamera,{makeDefault:!0,position:[10,8,10],fov:50}),(0,o.jsx)(c.OrbitControls,{enableDamping:!0,dampingFactor:.05,minDistance:5,maxDistance:25,maxPolarAngle:Math.PI/2.2}),(0,o.jsx)("ambientLight",{intensity:.3}),(0,o.jsx)("directionalLight",{position:[10,10,5],intensity:1,castShadow:!0,"shadow-mapSize-width":2048,"shadow-mapSize-height":2048,"shadow-camera-far":50,"shadow-camera-left":-10,"shadow-camera-right":10,"shadow-camera-top":10,"shadow-camera-bottom":-10}),(0,o.jsx)("hemisphereLight",{intensity:.3,groundColor:"#444444"}),(0,o.jsx)(y,{args:[20,20],cellSize:1,cellThickness:.5,cellColor:"#6366f1",sectionSize:5,sectionThickness:1,sectionColor:"#8b5cf6",fadeDistance:25,fadeStrength:1,position:[0,-.01,0]}),(0,o.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],position:[0,0,0],receiveShadow:!0,children:[(0,o.jsx)("planeGeometry",{args:[50,50]}),(0,o.jsx)("meshStandardMaterial",{color:"#1a1a2e"})]}),i>0&&(0,o.jsx)(Z,{taxRate:e,availableFunding:i,onSpawnComplete:()=>s(e=>e+1)})]})]})}e.s(["default",()=>ee],79561)}]);