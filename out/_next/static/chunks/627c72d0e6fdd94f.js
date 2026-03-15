(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,75236,e=>{"use strict";var t,i,r,n,s=e.i(11334),a=e.i(44440),o=e.i(3626),l=e.i(48683),u=e.i(31352),f=o,c=e.i(79035);let d=(t={cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new o.Color,sectionColor:new o.Color,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new o.Vector3,worldPlanePosition:new o.Vector3},i=`
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
  `,r=`
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
      #include <${c.version>=154?"colorspace_fragment":"encodings_fragment"}>
    }
  `,(n=class extends f.ShaderMaterial{constructor(e){for(const n in super({vertexShader:i,fragmentShader:r,...e}),t)this.uniforms[n]=new f.Uniform(t[n]),Object.defineProperty(this,n,{get(){return this.uniforms[n].value},set(e){this.uniforms[n].value=e}});this.uniforms=f.UniformsUtils.clone(this.uniforms)}}).key=f.MathUtils.generateUUID(),n),h=a.forwardRef(({args:e,cellColor:t="#000000",sectionColor:i="#2080ff",cellSize:r=.5,sectionSize:n=1,followCamera:f=!1,infiniteGrid:c=!1,fadeDistance:h=100,fadeStrength:p=1,fadeFrom:m=1,cellThickness:v=.5,sectionThickness:g=1,side:y=o.BackSide,...x},b)=>{(0,l.extend)({GridMaterial:d});let w=a.useRef(null);a.useImperativeHandle(b,()=>w.current,[]);let _=new o.Plane,S=new o.Vector3(0,1,0),A=new o.Vector3(0,0,0);return(0,u.useFrame)(e=>{_.setFromNormalAndCoplanarPoint(S,A).applyMatrix4(w.current.matrixWorld);let t=w.current.material,i=t.uniforms.worldCamProjPosition,r=t.uniforms.worldPlanePosition;_.projectPoint(e.camera.position,i.value),r.value.set(0,0,0).applyMatrix4(w.current.matrixWorld)}),a.createElement("mesh",(0,s.default)({ref:w,frustumCulled:!1},x),a.createElement("gridMaterial",(0,s.default)({transparent:!0,"extensions-derivatives":!0,side:y},{cellSize:r,sectionSize:n,cellColor:t,sectionColor:i,cellThickness:v,sectionThickness:g},{fadeDistance:h,fadeStrength:p,fadeFrom:m,infiniteGrid:c,followCamera:f})),a.createElement("planeGeometry",{args:e}))});e.s(["Grid",()=>h],75236)},9239,e=>{"use strict";let t,i;var r=e.i(11334),n=e.i(44440),s=e.i(3626),a=e.i(10278),o=s,l=s;let u=new l.Box3,f=new l.Vector3;class c extends l.InstancedBufferGeometry{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry",this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute("position",new l.Float32BufferAttribute([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute("uv",new l.Float32BufferAttribute([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return void 0!==t&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),null!==this.boundingBox&&this.computeBoundingBox(),null!==this.boundingSphere&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new l.InstancedInterleavedBuffer(t,6,1);return this.setAttribute("instanceStart",new l.InterleavedBufferAttribute(i,3,0)),this.setAttribute("instanceEnd",new l.InterleavedBufferAttribute(i,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let i;e instanceof Float32Array?i=e:Array.isArray(e)&&(i=new Float32Array(e));let r=new l.InstancedInterleavedBuffer(i,2*t,1);return this.setAttribute("instanceColorStart",new l.InterleavedBufferAttribute(r,t,0)),this.setAttribute("instanceColorEnd",new l.InterleavedBufferAttribute(r,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new l.WireframeGeometry(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){null===this.boundingBox&&(this.boundingBox=new l.Box3);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;void 0!==e&&void 0!==t&&(this.boundingBox.setFromBufferAttribute(e),u.setFromBufferAttribute(t),this.boundingBox.union(u))}computeBoundingSphere(){null===this.boundingSphere&&(this.boundingSphere=new l.Sphere),null===this.boundingBox&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(void 0!==e&&void 0!==t){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let r=0;for(let n=0,s=e.count;n<s;n++)f.fromBufferAttribute(e,n),r=Math.max(r,i.distanceToSquared(f)),f.fromBufferAttribute(t,n),r=Math.max(r,i.distanceToSquared(f));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}var d=s,h=e.i(77863),p=e.i(30438);class m extends d.ShaderMaterial{constructor(e){super({type:"LineMaterial",uniforms:d.UniformsUtils.clone(d.UniformsUtils.merge([h.UniformsLib.common,h.UniformsLib.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new d.Vector2(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
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
					#include <${p.version>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(e){!0===e?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(e){!!e!="USE_DASH"in this.defines&&(this.needsUpdate=!0),!0===e?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(e){!!e!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),!0===e?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}let v=p.version>=125?"uv1":"uv2",g=new o.Vector4,y=new o.Vector3,x=new o.Vector3,b=new o.Vector4,w=new o.Vector4,_=new o.Vector4,S=new o.Vector3,A=new o.Matrix4,M=new o.Line3,E=new o.Vector3,P=new o.Box3,C=new o.Sphere,z=new o.Vector4;function j(e,t,r){return z.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),z.multiplyScalar(1/z.w),z.x=i/r.width,z.y=i/r.height,z.applyMatrix4(e.projectionMatrixInverse),z.multiplyScalar(1/z.w),Math.abs(Math.max(z.x,z.y))}class k extends o.Mesh{constructor(e=new c,t=new m({color:0xffffff*Math.random()})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,n=0,s=t.count;e<s;e++,n+=2)y.fromBufferAttribute(t,e),x.fromBufferAttribute(i,e),r[n]=0===n?0:r[n-1],r[n+1]=r[n]+y.distanceTo(x);let n=new o.InstancedInterleavedBuffer(r,2,1);return e.setAttribute("instanceDistanceStart",new o.InterleavedBufferAttribute(n,1,0)),e.setAttribute("instanceDistanceEnd",new o.InterleavedBufferAttribute(n,1,1)),this}raycast(e,r){let n,s,a=this.material.worldUnits,l=e.camera;null!==l||a||console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');let u=void 0!==e.params.Line2&&e.params.Line2.threshold||0;t=e.ray;let f=this.matrixWorld,c=this.geometry,d=this.material;if(i=d.linewidth+u,null===c.boundingSphere&&c.computeBoundingSphere(),C.copy(c.boundingSphere).applyMatrix4(f),a)n=.5*i;else{let e=Math.max(l.near,C.distanceToPoint(t.origin));n=j(l,e,d.resolution)}if(C.radius+=n,!1!==t.intersectsSphere(C)){if(null===c.boundingBox&&c.computeBoundingBox(),P.copy(c.boundingBox).applyMatrix4(f),a)s=.5*i;else{let e=Math.max(l.near,P.distanceToPoint(t.origin));s=j(l,e,d.resolution)}P.expandByScalar(s),!1!==t.intersectsBox(P)&&(a?function(e,r){let n=e.matrixWorld,s=e.geometry,a=s.attributes.instanceStart,l=s.attributes.instanceEnd,u=Math.min(s.instanceCount,a.count);for(let s=0;s<u;s++){M.start.fromBufferAttribute(a,s),M.end.fromBufferAttribute(l,s),M.applyMatrix4(n);let u=new o.Vector3,f=new o.Vector3;t.distanceSqToSegment(M.start,M.end,f,u),f.distanceTo(u)<.5*i&&r.push({point:f,pointOnLine:u,distance:t.origin.distanceTo(f),object:e,face:null,faceIndex:s,uv:null,[v]:null})}}(this,r):function(e,r,n){let s=r.projectionMatrix,a=e.material.resolution,l=e.matrixWorld,u=e.geometry,f=u.attributes.instanceStart,c=u.attributes.instanceEnd,d=Math.min(u.instanceCount,f.count),h=-r.near;t.at(1,_),_.w=1,_.applyMatrix4(r.matrixWorldInverse),_.applyMatrix4(s),_.multiplyScalar(1/_.w),_.x*=a.x/2,_.y*=a.y/2,_.z=0,S.copy(_),A.multiplyMatrices(r.matrixWorldInverse,l);for(let r=0;r<d;r++){if(b.fromBufferAttribute(f,r),w.fromBufferAttribute(c,r),b.w=1,w.w=1,b.applyMatrix4(A),w.applyMatrix4(A),b.z>h&&w.z>h)continue;if(b.z>h){let e=b.z-w.z,t=(b.z-h)/e;b.lerp(w,t)}else if(w.z>h){let e=w.z-b.z,t=(w.z-h)/e;w.lerp(b,t)}b.applyMatrix4(s),w.applyMatrix4(s),b.multiplyScalar(1/b.w),w.multiplyScalar(1/w.w),b.x*=a.x/2,b.y*=a.y/2,w.x*=a.x/2,w.y*=a.y/2,M.start.copy(b),M.start.z=0,M.end.copy(w),M.end.z=0;let u=M.closestPointToPointParameter(S,!0);M.at(u,E);let d=o.MathUtils.lerp(b.z,w.z,u),p=d>=-1&&d<=1,m=S.distanceTo(E)<.5*i;if(p&&m){M.start.fromBufferAttribute(f,r),M.end.fromBufferAttribute(c,r),M.start.applyMatrix4(l),M.end.applyMatrix4(l);let i=new o.Vector3,s=new o.Vector3;t.distanceSqToSegment(M.start,M.end,s,i),n.push({point:s,pointOnLine:i,distance:t.origin.distanceTo(s),object:e,face:null,faceIndex:r,uv:null,[v]:null})}}}(this,l,r))}}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(g),this.material.uniforms.resolution.value.set(g.z,g.w))}}class R extends c{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,i=new Float32Array(2*t);for(let r=0;r<t;r+=3)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5];return super.setPositions(i),this}setColors(e,t=3){let i=e.length-t,r=new Float32Array(2*i);if(3===t)for(let n=0;n<i;n+=t)r[2*n]=e[n],r[2*n+1]=e[n+1],r[2*n+2]=e[n+2],r[2*n+3]=e[n+3],r[2*n+4]=e[n+4],r[2*n+5]=e[n+5];else for(let n=0;n<i;n+=t)r[2*n]=e[n],r[2*n+1]=e[n+1],r[2*n+2]=e[n+2],r[2*n+3]=e[n+3],r[2*n+4]=e[n+4],r[2*n+5]=e[n+5],r[2*n+6]=e[n+6],r[2*n+7]=e[n+7];return super.setColors(r,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class F extends k{constructor(e=new R,t=new m({color:0xffffff*Math.random()})){super(e,t),this.isLine2=!0,this.type="Line2"}}let V=n.forwardRef(function({points:e,color:t=0xffffff,vertexColors:i,linewidth:o,lineWidth:l,segments:u,dashed:f,...d},h){var p,v;let g=(0,a.useThree)(e=>e.size),y=n.useMemo(()=>u?new k:new F,[u]),[x]=n.useState(()=>new m),b=(null==i||null==(p=i[0])?void 0:p.length)===4?4:3,w=n.useMemo(()=>{let r=u?new c:new R,n=e.map(e=>{let t=Array.isArray(e);return e instanceof s.Vector3||e instanceof s.Vector4?[e.x,e.y,e.z]:e instanceof s.Vector2?[e.x,e.y,0]:t&&3===e.length?[e[0],e[1],e[2]]:t&&2===e.length?[e[0],e[1],0]:e});if(r.setPositions(n.flat()),i){t=0xffffff;let e=i.map(e=>e instanceof s.Color?e.toArray():e);r.setColors(e.flat(),b)}return r},[e,u,i,b]);return n.useLayoutEffect(()=>{y.computeLineDistances()},[e,y]),n.useLayoutEffect(()=>{f?x.defines.USE_DASH="":delete x.defines.USE_DASH,x.needsUpdate=!0},[f,x]),n.useEffect(()=>()=>{w.dispose(),x.dispose()},[w]),n.createElement("primitive",(0,r.default)({object:y,ref:h},d),n.createElement("primitive",{object:w,attach:"geometry"}),n.createElement("primitive",(0,r.default)({object:x,attach:"material",color:t,vertexColors:!!i,resolution:[g.width,g.height],linewidth:null!=(v=null!=o?o:l)?v:1,dashed:f,transparent:4===b},d)))});e.s(["Line",()=>V],9239)},58591,e=>{"use strict";var t=e.i(11334),i=e.i(44440);e.i(3626);let r=i.forwardRef(({args:e,children:r,...n},s)=>{let a=i.useRef(null);return i.useImperativeHandle(s,()=>a.current),i.useLayoutEffect(()=>void 0),i.createElement("mesh",(0,t.default)({ref:a},n),i.createElement("sphereGeometry",{attach:"geometry",args:e}),r)});e.s(["Sphere",()=>r])},39584,84085,e=>{"use strict";var t,i,r,n,s,a=e.i(87433),o=e.i(44440),l=e.i(31352),u=e.i(34005),f=e.i(69507),f=f,c=P(),d=e=>S(e,c),h=P();d.write=e=>S(e,h);var p=P();d.onStart=e=>S(e,p);var m=P();d.onFrame=e=>S(e,m);var v=P();d.onFinish=e=>S(e,v);var g=[];d.setTimeout=(e,t)=>{let i=d.now()+t,r=()=>{let e=g.findIndex(e=>e.cancel==r);~e&&g.splice(e,1),w-=!!~e},n={time:i,handler:e,cancel:r};return g.splice(y(i),0,n),w+=1,A(),n};var y=e=>~(~g.findIndex(t=>t.time>e)||~g.length);d.cancel=e=>{p.delete(e),m.delete(e),v.delete(e),c.delete(e),h.delete(e)},d.sync=e=>{_=!0,d.batchedUpdates(e),_=!1},d.throttle=e=>{let t;function i(){try{e(...t)}finally{t=null}}function r(...e){t=e,d.onStart(i)}return r.handler=e,r.cancel=()=>{p.delete(i),t=null},r};var x="u">typeof window?window.requestAnimationFrame:()=>{};d.use=e=>x=e,d.now="u">typeof performance?()=>performance.now():Date.now,d.batchedUpdates=e=>e(),d.catch=console.error,d.frameLoop="always",d.advance=()=>{"demand"!==d.frameLoop?console.warn("Cannot call the manual advancement of rafz whilst frameLoop is not set as demand"):E()};var b=-1,w=0,_=!1;function S(e,t){_?(t.delete(e),e(0)):(t.add(e),A())}function A(){b<0&&(b=0,"demand"!==d.frameLoop&&x(M))}function M(){~b&&(x(M),d.batchedUpdates(E))}function E(){let e=b,t=y(b=d.now());(t&&(C(g.splice(0,t),e=>e.handler()),w-=t),w)?(p.flush(),c.flush(e?Math.min(64,b-e):16.667),m.flush(),h.flush(),v.flush()):b=-1}function P(){let e=new Set,t=e;return{add(i){w+=+!(t!=e||e.has(i)),e.add(i)},delete:i=>(w-=t==e&&e.has(i)?1:0,e.delete(i)),flush(i){t.size&&(e=new Set,w-=t.size,C(t,t=>t(i)&&e.add(t)),w+=e.size,t=e)}}}function C(e,t){e.forEach(e=>{try{t(e)}catch(e){d.catch(e)}})}var z=Object.defineProperty,j={},k={assign:()=>W,colors:()=>D,createStringInterpolator:()=>t,skipAnimation:()=>G,to:()=>i,willAdvance:()=>q};for(var R in k)z(j,R,{get:k[R],enumerable:!0});function F(){}var V={arr:Array.isArray,obj:e=>!!e&&"Object"===e.constructor.name,fun:e=>"function"==typeof e,str:e=>"string"==typeof e,num:e=>"number"==typeof e,und:e=>void 0===e};function U(e,t){if(V.arr(e)){if(!V.arr(t)||e.length!==t.length)return!1;for(let i=0;i<e.length;i++)if(e[i]!==t[i])return!1;return!0}return e===t}function T(e,t,i){if(V.arr(e)){for(let r=0;r<e.length;r++)t.call(i,e[r],`${r}`);return}for(let r in e)e.hasOwnProperty(r)&&t.call(i,e[r],r)}var O=e=>V.und(e)?[]:V.arr(e)?e:[e];function L(e,t){if(e.size){let i=Array.from(e);e.clear(),i.forEach(t)}}var I=(e,...t)=>L(e,e=>e(...t)),B=()=>"u"<typeof window||!window.navigator||/ServerSideRendering|^Deno\//.test(window.navigator.userAgent),D=null,G=!1,q=F,W=e=>{e.to&&(i=e.to),e.now&&(d.now=e.now),void 0!==e.colors&&(D=e.colors),null!=e.skipAnimation&&(G=e.skipAnimation),e.createStringInterpolator&&(t=e.createStringInterpolator),e.requestAnimationFrame&&d.use(e.requestAnimationFrame),e.batchedUpdates&&(d.batchedUpdates=e.batchedUpdates),e.willAdvance&&(q=e.willAdvance),e.frameLoop&&(d.frameLoop=e.frameLoop)},N=new Set,$=[],H=[],Q=0,X={get idle(){return!N.size&&!$.length},start(e){Q>e.priority?(N.add(e),d.onStart(Y)):(Z(e),d(K))},advance:K,sort(e){if(Q)d.onFrame(()=>X.sort(e));else{let t=$.indexOf(e);~t&&($.splice(t,1),J(e))}},clear(){$=[],N.clear()}};function Y(){N.forEach(Z),N.clear(),d(K)}function Z(e){$.includes(e)||J(e)}function J(e){var t,i;let r;$.splice((t=$,i=t=>t.priority>e.priority,(r=t.findIndex(i))<0?t.length:r),0,e)}function K(e){let t=H;for(let i=0;i<$.length;i++){let r=$[i];Q=r.priority,!r.idle&&(q(r),r.advance(e),r.idle||t.push(r))}return Q=0,(H=$).length=0,($=t).length>0}var ee="[-+]?\\d*\\.?\\d+",et=ee+"%";function ei(...e){return"\\(\\s*("+e.join(")\\s*,\\s*(")+")\\s*\\)"}var er=RegExp("rgb"+ei(ee,ee,ee)),en=RegExp("rgba"+ei(ee,ee,ee,ee)),es=RegExp("hsl"+ei(ee,et,et)),ea=RegExp("hsla"+ei(ee,et,et,ee)),eo=/^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,el=/^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,eu=/^#([0-9a-fA-F]{6})$/,ef=/^#([0-9a-fA-F]{8})$/;function ec(e,t,i){return(i<0&&(i+=1),i>1&&(i-=1),i<1/6)?e+(t-e)*6*i:i<.5?t:i<2/3?e+(t-e)*(2/3-i)*6:e}function ed(e,t,i){let r=i<.5?i*(1+t):i+t-i*t,n=2*i-r;return Math.round(255*ec(n,r,e+1/3))<<24|Math.round(255*ec(n,r,e))<<16|Math.round(255*ec(n,r,e-1/3))<<8}function eh(e){let t=parseInt(e,10);return t<0?0:t>255?255:t}function ep(e){return(parseFloat(e)%360+360)%360/360}function em(e){let t=parseFloat(e);return t<0?0:t>1?255:Math.round(255*t)}function ev(e){let t=parseFloat(e);return t<0?0:t>100?1:t/100}function eg(e){let t,i="number"==typeof e?e>>>0===e&&e>=0&&e<=0xffffffff?e:null:(t=eu.exec(e))?parseInt(t[1]+"ff",16)>>>0:D&&void 0!==D[e]?D[e]:(t=er.exec(e))?(eh(t[1])<<24|eh(t[2])<<16|eh(t[3])<<8|255)>>>0:(t=en.exec(e))?(eh(t[1])<<24|eh(t[2])<<16|eh(t[3])<<8|em(t[4]))>>>0:(t=eo.exec(e))?parseInt(t[1]+t[1]+t[2]+t[2]+t[3]+t[3]+"ff",16)>>>0:(t=ef.exec(e))?parseInt(t[1],16)>>>0:(t=el.exec(e))?parseInt(t[1]+t[1]+t[2]+t[2]+t[3]+t[3]+t[4]+t[4],16)>>>0:(t=es.exec(e))?(255|ed(ep(t[1]),ev(t[2]),ev(t[3])))>>>0:(t=ea.exec(e))?(ed(ep(t[1]),ev(t[2]),ev(t[3]))|em(t[4]))>>>0:null;if(null===i)return e;let r=(0xff000000&(i=i||0))>>>24,n=(0xff0000&i)>>>16,s=(65280&i)>>>8,a=(255&i)/255;return`rgba(${r}, ${n}, ${s}, ${a})`}var ey=(e,i,r)=>{if(V.fun(e))return e;if(V.arr(e))return ey({range:e,output:i,extrapolate:r});if(V.str(e.output[0]))return t(e);let n=e.output,s=e.range||[0,1],a=e.extrapolateLeft||e.extrapolate||"extend",o=e.extrapolateRight||e.extrapolate||"extend",l=e.easing||(e=>e);return t=>{let i=function(e,t){for(var i=1;i<t.length-1&&!(t[i]>=e);++i);return i-1}(t,s);return function(e,t,i,r,n,s,a,o,l){let u=l?l(e):e;if(u<t)if("identity"===a)return u;else"clamp"===a&&(u=t);if(u>i)if("identity"===o)return u;else"clamp"===o&&(u=i);return r===n?r:t===i?e<=t?r:n:(t===-1/0?u=-u:i===1/0?u-=t:u=(u-t)/(i-t),u=s(u),r===-1/0?u=-u:n===1/0?u+=r:u=u*(n-r)+r,u)}(t,s[i],s[i+1],n[i],n[i+1],l,a,o,e.map)}},ex=Symbol.for("FluidValue.get"),eb=Symbol.for("FluidValue.observers"),ew=e=>!!(e&&e[ex]),e_=e=>e&&e[ex]?e[ex]():e,eS=e=>e[eb]||null;function eA(e,t){let i=e[eb];i&&i.forEach(e=>{e.eventObserved?e.eventObserved(t):e(t)})}var eM=class{constructor(e){if(!e&&!(e=this.get))throw Error("Unknown getter");eE(this,e)}},eE=(e,t)=>ez(e,ex,t);function eP(e,t){if(e[ex]){let i=e[eb];i||ez(e,eb,i=new Set),!i.has(t)&&(i.add(t),e.observerAdded&&e.observerAdded(i.size,t))}return t}function eC(e,t){let i=e[eb];if(i&&i.has(t)){let r=i.size-1;r?i.delete(t):e[eb]=null,e.observerRemoved&&e.observerRemoved(r,t)}}var ez=(e,t,i)=>Object.defineProperty(e,t,{value:i,writable:!0,configurable:!0}),ej=/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,ek=/(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi,eR=RegExp(`(${ej.source})(%|[a-z]+)`,"i"),eF=/rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi,eV=/var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/,eU=e=>{let[t,i]=eT(e);if(!t||B())return e;let r=window.getComputedStyle(document.documentElement).getPropertyValue(t);if(r)return r.trim();if(i&&i.startsWith("--")){let e=window.getComputedStyle(document.documentElement).getPropertyValue(i);if(e)return e}else if(i&&eV.test(i))return eU(i);else if(i)return i;return e},eT=e=>{let t=eV.exec(e);if(!t)return[,];let[,i,r]=t;return[i,r]},eO=(e,t,i,r,n)=>`rgba(${Math.round(t)}, ${Math.round(i)}, ${Math.round(r)}, ${n})`,eL=e=>{r||(r=D?RegExp(`(${Object.keys(D).join("|")})(?!\\w)`,"g"):/^\b$/);let t=e.output.map(e=>e_(e).replace(eV,eU).replace(ek,eg).replace(r,eg)),i=t.map(e=>e.match(ej).map(Number)),n=i[0].map((e,t)=>i.map(e=>{if(!(t in e))throw Error('The arity of each "output" value must be equal');return e[t]})).map(t=>ey({...e,output:t}));return e=>{let i=!eR.test(t[0])&&t.find(e=>eR.test(e))?.replace(ej,""),r=0;return t[0].replace(ej,()=>`${n[r++](e)}${i||""}`).replace(eF,eO)}},eI="react-spring: ",eB=e=>{let t=!1;if("function"!=typeof e)throw TypeError(`${eI}once requires a function parameter`);return(...i)=>{t||(e(...i),t=!0)}},eD=eB(console.warn);function eG(){eD(`${eI}The "interpolate" function is deprecated in v9 (use "to" instead)`)}var eq=eB(console.warn);function eW(e){return V.str(e)&&("#"==e[0]||/\d/.test(e)||!B()&&eV.test(e)||e in(D||{}))}var eN=new WeakMap,e$=e=>e.forEach(({target:e,contentRect:t})=>eN.get(e)?.forEach(e=>e(t))),eH=new Set,eQ=(e,{container:t=document.documentElement}={})=>{let i;if(t===document.documentElement){let t;return eH.add(e),s||(t=()=>{eH.forEach(e=>e({width:window.innerWidth,height:window.innerHeight}))},window.addEventListener("resize",t),s=()=>{window.removeEventListener("resize",t)}),()=>{eH.delete(e),!eH.size&&s&&(s(),s=void 0)}}return!n&&"u">typeof ResizeObserver&&(n=new ResizeObserver(e$)),(i=eN.get(t))||(i=new Set,eN.set(t,i)),i.add(e),n&&n.observe(t),()=>{let i=eN.get(t);i&&(i.delete(e),!i.size&&n&&n.unobserve(t))}},eX={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}},eY=class{constructor(e,t){this.createAxis=()=>({current:0,progress:0,scrollLength:0}),this.updateAxis=e=>{let t,i,r=this.info[e],{length:n,position:s}=eX[e];r.current=this.container[`scroll${s}`],r.scrollLength=this.container[`scroll${n}`]-this.container[`client${n}`],t=r.scrollLength,i=r.current,r.progress=t-0==0?1:(i-0)/(t-0)},this.update=()=>{this.updateAxis("x"),this.updateAxis("y")},this.sendEvent=()=>{this.callback(this.info)},this.advance=()=>{this.update(),this.sendEvent()},this.callback=e,this.container=t,this.info={time:0,x:this.createAxis(),y:this.createAxis()}}},eZ=new WeakMap,eJ=new WeakMap,eK=new WeakMap,e0=e=>e===document.documentElement?window:e,e1=B()?o.useEffect:o.useLayoutEffect;function e2(){let e,t=(0,o.useState)()[1],i=(e=(0,o.useRef)(!1),e1(()=>(e.current=!0,()=>{e.current=!1}),[]),e);return()=>{i.current&&t(Math.random())}}var e3=e=>(0,o.useEffect)(e,e5),e5=[];function e4(e){let t=(0,o.useRef)(void 0);return(0,o.useEffect)(()=>{t.current=e}),t.current}var e8=Symbol.for("Animated:node"),e6=e=>e&&e[e8],e9=(e,t)=>Object.defineProperty(e,e8,{value:t,writable:!0,configurable:!0}),e7=e=>e&&e[e8]&&e[e8].getPayload(),te=class{constructor(){e9(this,this)}getPayload(){return this.payload||[]}},tt=class e extends te{constructor(e){super(),this._value=e,this.done=!0,this.durationProgress=0,V.num(this._value)&&(this.lastPosition=this._value)}static create(t){return new e(t)}getPayload(){return[this]}getValue(){return this._value}setValue(e,t){return V.num(e)&&(this.lastPosition=e,t&&(e=Math.round(e/t)*t,this.done&&(this.lastPosition=e))),this._value!==e&&(this._value=e,!0)}reset(){let{done:e}=this;this.done=!1,V.num(this._value)&&(this.elapsedTime=0,this.durationProgress=0,this.lastPosition=this._value,e&&(this.lastVelocity=null),this.v0=null)}},ti=class e extends tt{constructor(e){super(0),this._string=null,this._toString=ey({output:[e,e]})}static create(t){return new e(t)}getValue(){let e=this._string;return null==e?this._string=this._toString(this._value):e}setValue(e){if(V.str(e)){if(e==this._string)return!1;this._string=e,this._value=1}else{if(!super.setValue(e))return!1;this._string=null}return!0}reset(e){e&&(this._toString=ey({output:[this.getValue(),e]})),this._value=0,super.reset()}},tr={dependencies:null},tn=class extends te{constructor(e){super(),this.source=e,this.setValue(e)}getValue(e){let t={};return T(this.source,(i,r)=>{i&&i[e8]===i?t[r]=i.getValue(e):ew(i)?t[r]=e_(i):e||(t[r]=i)}),t}setValue(e){this.source=e,this.payload=this._makePayload(e)}reset(){let e;this.payload&&(e=this.payload,e.forEach(e=>e.reset()))}_makePayload(e){if(e){let t=new Set;return T(e,this._addToPayload,t),Array.from(t)}}_addToPayload(e){let t;tr.dependencies&&ew(e)&&tr.dependencies.add(e);let i=e7(e);i&&(t=e=>this.add(e),i.forEach(t))}},ts=class e extends tn{constructor(e){super(e)}static create(t){return new e(t)}getValue(){return this.source.map(e=>e.getValue())}setValue(e){let t=this.getPayload();return e.length==t.length?t.map((t,i)=>t.setValue(e[i])).some(Boolean):(super.setValue(e.map(ta)),!0)}};function ta(e){return(eW(e)?ti:tt).create(e)}function to(e){let t=e6(e);return t?t.constructor:V.arr(e)?ts:eW(e)?ti:tt}var tl=(e,t)=>{let i=!V.fun(e)||e.prototype&&e.prototype.isReactComponent;return(0,o.forwardRef)((r,n)=>{var s,a;let l,u=(0,o.useRef)(null),f=i&&(0,o.useCallback)(e=>{var t,i;t=n,i=e,t&&(V.fun(t)?t(i):t.current=i),u.current=i},[n]),[c,h]=(s=r,a=t,tr.dependencies=l=new Set,s.style&&(s={...s,style:a.createAnimatedStyle(s.style)}),s=new tn(s),tr.dependencies=null,[s,l]),p=e2(),m=()=>{let e=u.current;i&&!e||!1===(!!e&&t.applyAnimatedValues(e,c.getValue(!0)))&&p()},v=new tu(m,h),g=(0,o.useRef)(void 0);e1(()=>{let e;return g.current=v,e=e=>eP(e,v),h.forEach(e),()=>{if(g.current){let e;e=g.current.deps,e.forEach(e=>eC(e,g.current)),d.cancel(g.current.update)}}}),(0,o.useEffect)(m,[]),e3(()=>()=>{let e,t=g.current;e=t.deps,e.forEach(e=>eC(e,t))});let y=t.getComponentProps(c.getValue());return o.createElement(e,{...y,ref:f})})},tu=class{constructor(e,t){this.update=e,this.deps=t}eventObserved(e){"change"==e.type&&d.write(this.update)}},tf=Symbol.for("AnimatedComponent"),tc=e=>V.str(e)?e:e&&V.str(e.displayName)?e.displayName:V.fun(e)&&e.name||null,td=class{};function th(e,...t){return V.fun(e)?e(...t):e}e.s(["Any",()=>td],87918);var tp=(e,t)=>!0===e||!!(t&&e&&(V.fun(e)?e(t):O(e).includes(t))),tm=(e,t)=>V.obj(e)?t&&e[t]:e,tv=(e,t)=>!0===e.default?e[t]:e.default?e.default[t]:void 0,tg=e=>e,ty=(e,t=tg)=>{let i=tx;e.default&&!0!==e.default&&(i=Object.keys(e=e.default));let r={};for(let n of i){let i=t(e[n],n);V.und(i)||(r[n]=i)}return r},tx=["config","onProps","onStart","onChange","onPause","onResume","onRest"],tb={config:1,from:1,to:1,ref:1,loop:1,reset:1,pause:1,cancel:1,reverse:1,immediate:1,default:1,delay:1,onProps:1,onStart:1,onChange:1,onPause:1,onResume:1,onRest:1,onResolve:1,items:1,trail:1,sort:1,expires:1,initial:1,enter:1,update:1,leave:1,children:1,onDestroyed:1,keys:1,callId:1,parentId:1};function tw(e){let t=function(e){let t={},i=0;if(T(e,(e,r)=>{!tb[r]&&(t[r]=e,i++)}),i)return t}(e);if(t){let i={to:t};return T(e,(e,r)=>r in t||(i[r]=e)),i}return{...e}}function t_(e){return e=e_(e),V.arr(e)?e.map(t_):eW(e)?j.createStringInterpolator({range:[0,1],output:[e,e]})(1):e}function tS(e){for(let t in e)return!0;return!1}function tA(e){return V.fun(e)||V.arr(e)&&V.obj(e[0])}function tM(e,t){e.ref?.delete(e),t?.delete(e)}function tE(e,t){t&&e.ref!==t&&(e.ref?.delete(e),t.add(e),e.ref=t)}function tP(e,t,i=1e3){e1(()=>{if(t){let r=0;e.forEach((e,n)=>{let s=e.current;if(s.length){let a=i*t[n];isNaN(a)?a=r:r=a,s.forEach(e=>{let t;t=e.queue,t.forEach(e=>{let t=e.delay;e.delay=e=>a+th(t||0,e)})}),e.start()}})}else{let t=Promise.resolve();e.forEach(e=>{let i=e.current;if(i.length){let r=i.map(e=>{let t=e.queue;return e.queue=[],t});t=t.then(()=>{let t;return t=(e,t)=>{let i,n;return i=r[t]||[],n=t=>e.queue.push(t),i.forEach(n)},i.forEach(t),Promise.all(e.start())})}})}})}var tC={default:{tension:170,friction:26},gentle:{tension:120,friction:14},wobbly:{tension:180,friction:12},stiff:{tension:210,friction:20},slow:{tension:280,friction:60},molasses:{tension:280,friction:120}},tz={...tC.default,mass:1,damping:1,easing:e=>e,clamp:!1},tj=class{constructor(){this.velocity=0,Object.assign(this,tz)}};function tk(e,t){if(V.und(t.decay)){let i=!V.und(t.tension)||!V.und(t.friction);!i&&V.und(t.frequency)&&V.und(t.damping)&&V.und(t.mass)||(e.duration=void 0,e.decay=void 0),i&&(e.frequency=void 0)}else e.duration=void 0}var tR=[],tF=class{constructor(){this.changed=!1,this.values=tR,this.toValues=null,this.fromValues=tR,this.config=new tj,this.immediate=!1}};function tV(e,{key:t,props:i,defaultProps:r,state:n,actions:s}){return new Promise((a,o)=>{let l,u,f=tp(i.cancel??r?.cancel,t);if(f)p();else{V.und(i.pause)||(n.paused=tp(i.pause,t));let e=r?.pause;!0!==e&&(e=n.paused||tp(e,t)),l=th(i.delay||0,t),e?(n.resumeQueue.add(h),s.pause()):(s.resume(),h())}function c(){n.resumeQueue.add(h),n.timeouts.delete(u),u.cancel(),l=u.time-d.now()}function h(){l>0&&!j.skipAnimation?(n.delayed=!0,u=d.setTimeout(p,l),n.pauseQueue.add(c),n.timeouts.add(u)):p()}function p(){n.delayed&&(n.delayed=!1),n.pauseQueue.delete(c),n.timeouts.delete(u),e<=(n.cancelId||0)&&(f=!0);try{s.start({...i,callId:e,cancel:f},a)}catch(e){o(e)}}})}var tU=(e,t)=>1==t.length?t[0]:t.some(e=>e.cancelled)?tL(e.get()):t.every(e=>e.noop)?tT(e.get()):tO(e.get(),t.every(e=>e.finished)),tT=e=>({value:e,noop:!0,finished:!0,cancelled:!1}),tO=(e,t,i=!1)=>({value:e,finished:t,cancelled:i}),tL=e=>({value:e,cancelled:!0,finished:!1});function tI(e,t,i,r){let{callId:n,parentId:s,onRest:a}=t,{asyncTo:o,promise:l}=i;return s||e!==o||t.reset?i.promise=(async()=>{let u,f,c;i.asyncId=n,i.asyncTo=e;let h=ty(t,(e,t)=>"onRest"===t?void 0:e),p=new Promise((e,t)=>(u=e,f=t)),m=e=>{let t=n<=(i.cancelId||0)&&tL(r)||n!==i.asyncId&&tO(r,!1);if(t)throw e.result=t,f(e),e},v=(e,t)=>{let s=new tD,a=new tG;return(async()=>{if(j.skipAnimation)throw tB(i),a.result=tO(r,!1),f(a),a;m(s);let o=V.obj(e)?{...e}:{...t,to:e};o.parentId=n,T(h,(e,t)=>{V.und(o[t])&&(o[t]=e)});let l=await r.start(o);return m(s),i.paused&&await new Promise(e=>{i.resumeQueue.add(e)}),l})()};if(j.skipAnimation)return tB(i),tO(r,!1);try{let t;t=V.arr(e)?(async e=>{for(let t of e)await v(t)})(e):Promise.resolve(e(v,r.stop.bind(r))),await Promise.all([t.then(u),p]),c=tO(r.get(),!0,!1)}catch(e){if(e instanceof tD)c=e.result;else if(e instanceof tG)c=e.result;else throw e}finally{n==i.asyncId&&(i.asyncId=s,i.asyncTo=s?o:void 0,i.promise=s?l:void 0)}return V.fun(a)&&d.batchedUpdates(()=>{a(c,r,r.item)}),c})():l}function tB(e,t){L(e.timeouts,e=>e.cancel()),e.pauseQueue.clear(),e.resumeQueue.clear(),e.asyncId=e.asyncTo=e.promise=void 0,t&&(e.cancelId=t)}var tD=class extends Error{constructor(){super("An async animation has been interrupted. You see this error because you forgot to use `await` or `.catch(...)` on its returned promise.")}},tG=class extends Error{constructor(){super("SkipAnimationSignal")}},tq=1,tW=class extends eM{constructor(){super(...arguments),this.id=tq++,this._priority=0}get priority(){return this._priority}set priority(e){this._priority!=e&&(this._priority=e,this._onPriorityChange(e))}get(){let e=e6(this);return e&&e.getValue()}to(...e){return j.to(this,e)}interpolate(...e){return eG(),j.to(this,e)}toJSON(){return this.get()}observerAdded(e){1==e&&this._attach()}observerRemoved(e){0==e&&this._detach()}_attach(){}_detach(){}_onChange(e,t=!1){eA(this,{type:"change",parent:this,value:e,idle:t})}_onPriorityChange(e){this.idle||X.sort(this),eA(this,{type:"priority",parent:this,priority:e})}},tN=Symbol.for("SpringPhase"),t$=e=>(1&e[tN])>0,tH=e=>(2&e[tN])>0,tQ=e=>(4&e[tN])>0,tX=(e,t)=>t?e[tN]|=3:e[tN]&=-3,tY=(e,t)=>t?e[tN]|=4:e[tN]&=-5,tZ=class extends tW{constructor(e,t){if(super(),this.animation=new tF,this.defaultProps={},this._state={paused:!1,delayed:!1,pauseQueue:new Set,resumeQueue:new Set,timeouts:new Set},this._pendingCalls=new Set,this._lastCallId=0,this._lastToId=0,this._memoizedDuration=0,!V.und(e)||!V.und(t)){const i=V.obj(e)?{...e}:{...t,from:e};V.und(i.default)&&(i.default=!0),this.start(i)}}get idle(){return!(tH(this)||this._state.asyncTo)||tQ(this)}get goal(){return e_(this.animation.to)}get velocity(){let e=e6(this);return e instanceof tt?e.lastVelocity||0:e.getPayload().map(e=>e.lastVelocity||0)}get hasAnimated(){return t$(this)}get isAnimating(){return tH(this)}get isPaused(){return tQ(this)}get isDelayed(){return this._state.delayed}advance(e){let t=!0,i=!1,r=this.animation,{toValues:n}=r,{config:s}=r,a=e7(r.to);!a&&ew(r.to)&&(n=O(e_(r.to))),r.values.forEach((o,l)=>{if(o.done)return;let u=o.constructor==ti?1:a?a[l].lastPosition:n[l],f=r.immediate,c=u;if(!f){let t;if(c=o.lastPosition,s.tension<=0){o.done=!0;return}let i=o.elapsedTime+=e,n=r.fromValues[l],a=null!=o.v0?o.v0:o.v0=V.arr(s.velocity)?s.velocity[l]:s.velocity,d=s.precision||(n==u?.005:Math.min(1,.001*Math.abs(u-n)));if(V.und(s.duration))if(s.decay){let e=!0===s.decay?.998:s.decay,r=Math.exp(-(1-e)*i);c=n+a/(1-e)*(1-r),f=Math.abs(o.lastPosition-c)<=d,t=a*r}else{t=null==o.lastVelocity?a:o.lastVelocity;let i=s.restVelocity||d/10,r=s.clamp?0:s.bounce,l=!V.und(r),h=n==u?o.v0>0:n<u,p=Math.ceil(e/1);for(let e=0;e<p&&!(!(Math.abs(t)>i)&&(f=Math.abs(u-c)<=d));++e){l&&(c==u||c>u==h)&&(t=-t*r,c=u);let e=(-(1e-6*s.tension)*(c-u)+-(.001*s.friction)*t)/s.mass;t+=+e,c+=+t}}else{let r=1;s.duration>0&&(this._memoizedDuration!==s.duration&&(this._memoizedDuration=s.duration,o.durationProgress>0&&(o.elapsedTime=s.duration*o.durationProgress,i=o.elapsedTime+=e)),o.durationProgress=r=(r=(s.progress||0)+i/this._memoizedDuration)>1?1:r<0?0:r),t=((c=n+s.easing(r)*(u-n))-o.lastPosition)/e,f=1==r}o.lastVelocity=t,Number.isNaN(c)&&(console.warn("Got NaN while animating:",this),f=!0)}a&&!a[l].done&&(f=!1),f?o.done=!0:t=!1,o.setValue(c,s.round)&&(i=!0)});let o=e6(this),l=o.getValue();if(t){let e=e_(r.to);(l!==e||i)&&!s.decay?(o.setValue(e),this._onChange(e)):i&&s.decay&&this._onChange(l),this._stop()}else i&&this._onChange(l)}set(e){return d.batchedUpdates(()=>{this._stop(),this._focus(e),this._set(e)}),this}pause(){this._update({pause:!0})}resume(){this._update({pause:!1})}finish(){if(tH(this)){let{to:e,config:t}=this.animation;d.batchedUpdates(()=>{this._onStart(),t.decay||this._set(e,!1),this._stop()})}return this}update(e){return(this.queue||(this.queue=[])).push(e),this}start(e,t){let i;return V.und(e)?(i=this.queue||[],this.queue=[]):i=[V.obj(e)?e:{...t,to:e}],Promise.all(i.map(e=>this._update(e))).then(e=>tU(this,e))}stop(e){let{to:t}=this.animation;return this._focus(this.get()),tB(this._state,e&&this._lastCallId),d.batchedUpdates(()=>this._stop(t,e)),this}reset(){this._update({reset:!0})}eventObserved(e){"change"==e.type?this._start():"priority"==e.type&&(this.priority=e.priority+1)}_prepareNode(e){let t=this.key||"",{to:i,from:r}=e;(null==(i=V.obj(i)?i[t]:i)||tA(i))&&(i=void 0),null==(r=V.obj(r)?r[t]:r)&&(r=void 0);let n={to:i,from:r};return!t$(this)&&(e.reverse&&([i,r]=[r,i]),r=e_(r),V.und(r)?e6(this)||this._set(i):this._set(r)),n}_update({...e},t){let{key:i,defaultProps:r}=this;e.default&&Object.assign(r,ty(e,(e,t)=>/^on/.test(t)?tm(e,i):e)),t3(this,e,"onProps"),t5(this,"onProps",e,this);let n=this._prepareNode(e);if(Object.isFrozen(this))throw Error("Cannot animate a `SpringValue` object that is frozen. Did you forget to pass your component to `animated(...)` before animating its props?");let s=this._state;return tV(++this._lastCallId,{key:i,props:e,defaultProps:r,state:s,actions:{pause:()=>{tQ(this)||(tY(this,!0),I(s.pauseQueue),t5(this,"onPause",tO(this,tJ(this,this.animation.to)),this))},resume:()=>{tQ(this)&&(tY(this,!1),tH(this)&&this._resume(),I(s.resumeQueue),t5(this,"onResume",tO(this,tJ(this,this.animation.to)),this))},start:this._merge.bind(this,n)}}).then(i=>{if(e.loop&&i.finished&&!(t&&i.noop)){let t=tK(e);if(t)return this._update(t,!0)}return i})}_merge(e,t,i){if(t.cancel)return this.stop(!0),i(tL(this));let r=!V.und(e.to),n=!V.und(e.from);if(r||n)if(!(t.callId>this._lastToId))return i(tL(this));else this._lastToId=t.callId;let{key:s,defaultProps:a,animation:o}=this,{to:l,from:u}=o,{to:f=l,from:c=u}=e;n&&!r&&(!t.default||V.und(f))&&(f=c),t.reverse&&([f,c]=[c,f]);let h=!U(c,u);h&&(o.from=c),c=e_(c);let p=!U(f,l);p&&this._focus(f);let m=tA(t.to),{config:v}=o,{decay:g,velocity:y}=v;(r||n)&&(v.velocity=0),t.config&&!m&&function(e,t,i){for(let r in i&&(tk(i={...i},t),t={...i,...t}),tk(e,t),Object.assign(e,t),tz)null==e[r]&&(e[r]=tz[r]);let{frequency:r,damping:n}=e,{mass:s}=e;V.und(r)||(r<.01&&(r=.01),n<0&&(n=0),e.tension=Math.pow(2*Math.PI/r,2)*s,e.friction=4*Math.PI*n*s/r)}(v,th(t.config,s),t.config!==a.config?th(a.config,s):void 0);let x=e6(this);if(!x||V.und(f))return i(tO(this,!0));let b=V.und(t.reset)?n&&!t.default:!V.und(c)&&tp(t.reset,s),w=b?c:this.get(),_=t_(f),S=V.num(_)||V.arr(_)||eW(_),A=!m&&(!S||tp(a.immediate||t.immediate,s));if(p){let e=to(f);if(e!==x.constructor)if(A)x=this._set(_);else throw Error(`Cannot animate between ${x.constructor.name} and ${e.name}, as the "to" prop suggests`)}let M=x.constructor,E=ew(f),P=!1;if(!E){let e=b||!t$(this)&&h;(p||e)&&(E=!(P=U(t_(w),_))),(U(o.immediate,A)||A)&&U(v.decay,g)&&U(v.velocity,y)||(E=!0)}if(P&&tH(this)&&(o.changed&&!b?E=!0:E||this._stop(l)),!m&&((E||ew(l))&&(o.values=x.getPayload(),o.toValues=ew(f)?null:M==ti?[1]:O(_)),o.immediate!=A&&(o.immediate=A,A||b||this._set(l)),E)){let e,{onRest:r}=o;e=e=>t3(this,t,e),t2.forEach(e);let n=tO(this,tJ(this,l));I(this._pendingCalls,n),this._pendingCalls.add(i),o.changed&&d.batchedUpdates(()=>{o.changed=!b,r?.(n,this),b?th(a.onRest,n):o.onStart?.(n,this)})}b&&this._set(w),m?i(tI(t.to,t,this._state,this)):E?this._start():tH(this)&&!p?this._pendingCalls.add(i):i(tT(w))}_focus(e){let t=this.animation;e!==t.to&&(eS(this)&&this._detach(),t.to=e,eS(this)&&this._attach())}_attach(){let e=0,{to:t}=this.animation;ew(t)&&(eP(t,this),t instanceof tW&&(e=t.priority+1)),this.priority=e}_detach(){let{to:e}=this.animation;ew(e)&&eC(e,this)}_set(e,t=!0){let i=e_(e);if(!V.und(i)){let e=e6(this);if(!e||!U(i,e.getValue())){let r=to(i);e&&e.constructor==r?e.setValue(i):e9(this,r.create(i)),e&&d.batchedUpdates(()=>{this._onChange(i,t)})}}return e6(this)}_onStart(){let e=this.animation;e.changed||(e.changed=!0,t5(this,"onStart",tO(this,tJ(this,e.to)),this))}_onChange(e,t){t||(this._onStart(),th(this.animation.onChange,e,this)),th(this.defaultProps.onChange,e,this),super._onChange(e,t)}_start(){let e=this.animation;e6(this).reset(e_(e.to)),e.immediate||(e.fromValues=e.values.map(e=>e.lastPosition)),!tH(this)&&(tX(this,!0),tQ(this)||this._resume())}_resume(){j.skipAnimation?this.finish():X.start(this)}_stop(e,t){if(tH(this)){let i;tX(this,!1);let r=this.animation;i=r.values,i.forEach(e=>{e.done=!0}),r.toValues&&(r.onChange=r.onPause=r.onResume=void 0),eA(this,{type:"idle",parent:this});let n=t?tL(this.get()):tO(this.get(),tJ(this,e??r.to));I(this._pendingCalls,n),r.changed&&(r.changed=!1,t5(this,"onRest",n,this))}}};function tJ(e,t){let i=t_(t);return U(t_(e.get()),i)}function tK(e,t=e.loop,i=e.to){let r=th(t);if(r){let n=!0!==r&&tw(r),s=(n||e).reverse,a=!n||n.reset;return t0({...e,loop:t,default:!1,pause:void 0,to:!s||tA(i)?i:void 0,from:a?e.from:void 0,reset:a,...n})}}function t0(e){let{to:t,from:i}=e=tw(e),r=new Set;return V.obj(t)&&t1(t,r),V.obj(i)&&t1(i,r),e.keys=r.size?Array.from(r):null,e}function t1(e,t){T(e,(e,i)=>null!=e&&t.add(i))}var t2=["onStart","onRest","onChange","onPause","onResume"];function t3(e,t,i){e.animation[i]=t[i]!==tv(t,i)?tm(t[i],e.key):void 0}function t5(e,t,...i){e.animation[t]?.(...i),e.defaultProps[t]?.(...i)}var t4=["onStart","onChange","onRest"],t8=1,t6=class{constructor(e,t){this.id=t8++,this.springs={},this.queue=[],this._lastAsyncId=0,this._active=new Set,this._changed=new Set,this._started=!1,this._state={paused:!1,pauseQueue:new Set,resumeQueue:new Set,timeouts:new Set},this._events={onStart:new Map,onChange:new Map,onRest:new Map},this._onFrame=this._onFrame.bind(this),t&&(this._flush=t),e&&this.start({default:!0,...e})}get idle(){return!this._state.asyncTo&&Object.values(this.springs).every(e=>e.idle&&!e.isDelayed&&!e.isPaused)}get item(){return this._item}set item(e){this._item=e}get(){let e={};return this.each((t,i)=>e[i]=t.get()),e}set(e){for(let t in e){let i=e[t];V.und(i)||this.springs[t].set(i)}}update(e){return e&&this.queue.push(t0(e)),this}start(e){let{queue:t}=this;return(e?t=O(e).map(t0):this.queue=[],this._flush)?this._flush(this,t):(is(this,t),t9(this,t))}stop(e,t){if(!!e!==e&&(t=e),t){let i,r=this.springs;i=O(t),i.forEach(t=>r[t].stop(!!e))}else tB(this._state,this._lastAsyncId),this.each(t=>t.stop(!!e));return this}pause(e){if(V.und(e))this.start({pause:!0});else{let t,i=this.springs;t=O(e),t.forEach(e=>i[e].pause())}return this}resume(e){if(V.und(e))this.start({pause:!1});else{let t,i=this.springs;t=O(e),t.forEach(e=>i[e].resume())}return this}each(e){T(this.springs,e)}_onFrame(){let{onStart:e,onChange:t,onRest:i}=this._events,r=this._active.size>0,n=this._changed.size>0;(r&&!this._started||n&&!this._started)&&(this._started=!0,L(e,([e,t])=>{t.value=this.get(),e(t,this,this._item)}));let s=!r&&this._started,a=n||s&&i.size?this.get():null;n&&t.size&&L(t,([e,t])=>{t.value=a,e(t,this,this._item)}),s&&(this._started=!1,L(i,([e,t])=>{t.value=a,e(t,this,this._item)}))}eventObserved(e){if("change"==e.type)this._changed.add(e.parent),e.idle||this._active.add(e.parent);else{if("idle"!=e.type)return;this._active.delete(e.parent)}d.onFrame(this._onFrame)}};function t9(e,t){return Promise.all(t.map(t=>t7(e,t))).then(t=>tU(e,t))}async function t7(e,t,i){let{keys:r,to:n,from:s,loop:a,onRest:o,onResolve:l}=t,u=V.obj(t.default)&&t.default;a&&(t.loop=!1),!1===n&&(t.to=null),!1===s&&(t.from=null);let f=V.arr(n)||V.fun(n)?n:void 0;if(f)t.to=void 0,t.onRest=void 0,u&&(u.onRest=void 0);else t4.forEach(i=>{let r=t[i];if(V.fun(r)){let n=e._events[i];t[i]=({finished:e,cancelled:t})=>{let i=n.get(r);i?(e||(i.finished=!1),t&&(i.cancelled=!0)):n.set(r,{value:null,finished:e||!1,cancelled:t||!1})},u&&(u[i]=t[i])}});let c=e._state;!c.paused===t.pause?(c.paused=t.pause,I(t.pause?c.pauseQueue:c.resumeQueue)):c.paused&&(t.pause=!0);let h=(r||Object.keys(e.springs)).map(i=>e.springs[i].start(t)),p=!0===t.cancel||!0===tv(t,"cancel");(f||p&&c.asyncId)&&h.push(tV(++e._lastAsyncId,{props:t,state:c,actions:{pause:F,resume:F,start(t,i){p?(tB(c,e._lastAsyncId),i(tL(e))):(t.onRest=o,i(tI(f,t,c,e)))}}})),c.paused&&await new Promise(e=>{c.resumeQueue.add(e)});let m=tU(e,await Promise.all(h));if(a&&m.finished&&!(i&&m.noop)){let i=tK(t,a,n);if(i)return is(e,[i]),t7(e,i,!0)}return l&&d.batchedUpdates(()=>l(m,e,e.item)),m}function ie(e,t){let i,r,n={...e.springs};return t&&(i=O(t),r=e=>{V.und(e.keys)&&(e=t0(e)),V.obj(e.to)||(e={...e,to:void 0}),ir(n,e,e=>ii(e))},i.forEach(r)),it(e,n),n}function it(e,t){T(t,(t,i)=>{e.springs[i]||(e.springs[i]=t,eP(t,e))})}function ii(e,t){let i=new tZ;return i.key=e,t&&eP(i,t),i}function ir(e,t,i){let r;t.keys&&(r=t.keys,r.forEach(r=>{(e[r]||(e[r]=i(r)))._prepareNode(t)}))}function is(e,t){t.forEach(t=>{ir(e.springs,t,t=>ii(t,e))})}var ia=o.createContext({pause:!1,immediate:!1}),io=()=>{let e=[],t=function(t){let r;eq(`${eI}Directly calling start instead of using the api object is deprecated in v9 (use ".start" instead), this will be removed in later 0.X.0 versions`);let n=[];return r=(e,r)=>{if(V.und(t))n.push(e.start());else{let s=i(t,e,r);s&&n.push(e.start(s))}},e.forEach(r),n};t.current=e,t.add=function(t){e.includes(t)||e.push(t)},t.delete=function(t){let i=e.indexOf(t);~i&&e.splice(i,1)},t.pause=function(){let t;return t=e=>e.pause(...arguments),e.forEach(t),this},t.resume=function(){let t;return t=e=>e.resume(...arguments),e.forEach(t),this},t.set=function(t){e.forEach((e,i)=>{let r=V.fun(t)?t(i,e):t;r&&e.set(r)})},t.start=function(t){let i,r=[];return i=(e,i)=>{if(V.und(t))r.push(e.start());else{let n=this._getProps(t,e,i);n&&r.push(e.start(n))}},e.forEach(i),r},t.stop=function(){let t;return t=e=>e.stop(...arguments),e.forEach(t),this},t.update=function(t){let i;return i=(e,i)=>e.update(this._getProps(t,e,i)),e.forEach(i),this};let i=function(e,t,i){return V.fun(e)?e(i,t):e};return t._getProps=i,t};function il(e,t,i){let r=V.fun(t)&&t;r&&!i&&(i=[]);let n=(0,o.useMemo)(()=>r||3==arguments.length?io():void 0,[]),s=(0,o.useRef)(0),a=e2(),l=(0,o.useMemo)(()=>({ctrls:[],queue:[],flush(e,t){let i=ie(e,t);return!(s.current>0)||l.queue.length||Object.keys(i).some(t=>!e.springs[t])?new Promise(r=>{it(e,i),l.queue.push(()=>{r(t9(e,t))}),a()}):t9(e,t)}}),[]),u=(0,o.useRef)([...l.ctrls]),f=(0,o.useRef)([]),c=e4(e)||0;function d(e,i){for(let n=e;n<i;n++){let e=u.current[n]||(u.current[n]=new t6(null,l.flush)),i=r?r(n,e):t[n];i&&(f.current[n]=function(e){let t=t0(e);return V.und(t.default)&&(t.default=ty(t)),t}(i))}}(0,o.useMemo)(()=>{let t;t=u.current.slice(e,c),t.forEach(e=>{tM(e,n),e.stop(!0)}),u.current.length=e,d(c,e)},[e]),(0,o.useMemo)(()=>{d(0,Math.min(c,e))},i);let h=u.current.map((e,t)=>ie(e,f.current[t])),p=(0,o.useContext)(ia),m=e4(p),v=p!==m&&tS(p);e1(()=>{let e;s.current++,l.ctrls=u.current;let{queue:t}=l;t.length&&(l.queue=[],t.forEach(e=>e()));e=u.current,e.forEach((e,t)=>{n?.add(e),v&&e.start({default:p});let i=f.current[t];i&&(tE(e,i.ref),e.ref?e.queue.push(i):e.start(i))})}),e3(()=>()=>{let e;e=l.ctrls,e.forEach(e=>e.stop(!0))});let g=h.map(e=>({...e}));return n?[g,n]:g}function iu(e,t){let i=V.fun(e),[[r],n]=il(1,i?e:[e],i?t||[]:t);return i||2==arguments.length?[r,n]:r}var ic=()=>io(),id=()=>(0,o.useState)(ic)[0],ih=(e,t)=>{var i;let r,n=(i=()=>new tZ(e,t),null===(r=(0,o.useRef)(null)).current&&(r.current=i()),r.current);return e3(()=>()=>{n.stop()}),n};function ip(e,t,i){let r,n=V.fun(t)&&t;n&&!i&&(i=[]);let s=!0,a=il(e,(e,i)=>{let a=n?n(e,i):t;return r=a.ref,s=s&&a.reverse,a},i||[{}]);if(e1(()=>{let e;e=a[1].current,e.forEach((e,t)=>{let i=a[1].current[t+(s?1:-1)];if(tE(e,r),e.ref){i&&e.update({to:i.springs});return}i?e.start({to:i.springs}):e.start()})},i),n||3==arguments.length){let e=r??a[1];return e._getProps=(t,i,r)=>{let n=V.fun(t)?t(r,i):t;if(n){let t=e.current[r+(n.reverse?1:-1)];return t&&(n.to=t.springs),n}},a}return a[0]}function im(e,t,i){let r,n=V.fun(t)&&t,{reset:s,sort:a,trail:l=0,expires:u=!0,exitBeforeEnter:f=!1,onDestroyed:c,ref:d,config:h}=n?n():t,p=(0,o.useMemo)(()=>n||3==arguments.length?io():void 0,[]),m=O(e),v=[],g=(0,o.useRef)(null),y=s?null:g.current;e1(()=>{g.current=v}),e3(()=>{let e;return e=e=>{p?.add(e.ctrl),e.ctrl.ref=p},v.forEach(e),()=>{let e;e=g.current,e.forEach(e=>{e.expired&&clearTimeout(e.expirationId),tM(e.ctrl,p),e.ctrl.stop(!0)})}});let x=function(e,{key:t,keys:i=t},r){if(null===i){let t=new Set;return e.map(e=>{let i=r&&r.find(i=>i.item===e&&"leave"!==i.phase&&!t.has(i));return i?(t.add(i),i.key):iv++})}return V.und(i)?e:V.fun(i)?e.map(i):O(i)}(m,n?n():t,y),b=s&&g.current||[];e1(()=>{let e;return e=({ctrl:e,item:t,key:i})=>{tM(e,p),th(c,t,i)},b.forEach(e)});let w=[];if(y&&y.forEach((e,t)=>{e.expired?(clearTimeout(e.expirationId),b.push(e)):~(t=w[t]=x.indexOf(e.key))&&(v[t]=e)}),r=(e,t)=>{v[t]||(v[t]={key:x[t],item:e,phase:"mount",ctrl:new t6},v[t].ctrl.item=e)},m.forEach(r),w.length){let e=-1,{leave:i}=n?n():t;w.forEach((t,r)=>{let n=y[r];~t?(e=v.indexOf(n),v[e]={...n,item:m[t]}):i&&v.splice(++e,0,n)})}V.fun(a)&&v.sort((e,t)=>a(e.item,t.item));let _=-l,S=e2(),A=ty(t),M=new Map,E=(0,o.useRef)(new Map),P=(0,o.useRef)(!1);v.forEach((e,i)=>{let r,s,a=e.key,o=e.phase,c=n?n():t,p=th(c.delay||0,a);if("mount"==o)r=c.enter,s="enter";else{let e=0>x.indexOf(a);if("leave"!=o)if(e)r=c.leave,s="leave";else{if(!(r=c.update))return;s="update"}else{if(e)return;r=c.enter,s="enter"}}if(r=th(r,e.item,i),!(r=V.obj(r)?tw(r):{to:r}).config){let t=h||A.config;r.config=th(t,e.item,i,s)}_+=l;let m={...A,delay:p+_,ref:d,immediate:c.immediate,reset:!1,...r};if("enter"==s&&V.und(m.from)){let r=n?n():t;m.from=th(V.und(r.initial)||y?r.from:r.initial,e.item,i)}let{onResolve:v}=m;m.onResolve=e=>{th(v,e);let t=g.current,i=t.find(e=>e.key===a);if(i&&(!e.cancelled||"update"==i.phase)&&i.ctrl.idle){let e=t.every(e=>e.ctrl.idle);if("leave"==i.phase){let t=th(u,i.item);if(!1!==t){let r=!0===t?0:t;if(i.expired=!0,!e&&r>0){r<=0x7fffffff&&(i.expirationId=setTimeout(S,r));return}}}e&&t.some(e=>e.expired)&&(E.current.delete(i),f&&(P.current=!0),S())}};let b=ie(e.ctrl,m);"leave"===s&&f?E.current.set(e,{phase:s,springs:b,payload:m}):M.set(e,{phase:s,springs:b,payload:m})});let C=(0,o.useContext)(ia),z=e4(C),j=C!==z&&tS(C);e1(()=>{j&&v.forEach(e=>{e.ctrl.start({default:C})})},[C]),M.forEach((e,t)=>{if(E.current.size){let e=v.findIndex(e=>e.key===t.key);v.splice(e,1)}}),e1(()=>{let e;e=E.current.size?E.current:M,e.forEach(({phase:e,payload:t},i)=>{let{ctrl:r}=i;i.phase=e,p?.add(r),j&&"enter"==e&&r.start({default:C}),t&&(tE(r,t.ref),(r.ref||p)&&!P.current?r.update(t):(r.start(t),P.current&&(P.current=!1)))})},s?void 0:i);let k=e=>o.createElement(o.Fragment,null,v.map((t,i)=>{let{springs:r}=M.get(t)||t.ctrl,n=e({...r},t.item,t,i),s=V.str(t.key)||V.num(t.key)?t.key:t.ctrl.id,a=o.version<"19.0.0",l=n?.props??{},u=a?n?.ref:l?.ref;return n&&n.type?o.createElement(n.type,{...l,key:s,ref:u}):n}));return p?[k,p]:k}var iv=1,ig=({container:e,...t}={})=>{let[i,r]=iu(()=>({scrollX:0,scrollY:0,scrollXProgress:0,scrollYProgress:0,...t}),[]);return e1(()=>{let t=((e,{container:t=document.documentElement}={})=>{let i=eK.get(t);i||(i=new Set,eK.set(t,i));let r=new eY(e,t);if(i.add(r),!eZ.has(t)){let e=()=>(i?.forEach(e=>e.advance()),!0);eZ.set(t,e);let r=e0(t);window.addEventListener("resize",e,{passive:!0}),t!==document.documentElement&&eJ.set(t,eQ(e,{container:t})),r.addEventListener("scroll",e,{passive:!0})}let n=eZ.get(t);return d(n),()=>{d.cancel(n);let e=eK.get(t);if(!e||(e.delete(r),e.size))return;let i=eZ.get(t);eZ.delete(t),i&&(e0(t).removeEventListener("scroll",i),window.removeEventListener("resize",i),eJ.get(t)?.())}})(({x:e,y:t})=>{r.start({scrollX:e.current,scrollXProgress:e.progress,scrollY:t.current,scrollYProgress:t.progress})},{container:e?.current||void 0});return()=>{let e;e=Object.values(i),e.forEach(e=>e.stop()),t()}},[]),i},iy=({container:e,...t})=>{let[i,r]=iu(()=>({width:0,height:0,...t}),[]);return e1(()=>{let n=eQ(({width:e,height:n})=>{r.start({width:e,height:n,immediate:0===i.width.get()||0===i.height.get()||!0===t.immediate})},{container:e?.current||void 0});return()=>{let e;e=Object.values(i),e.forEach(e=>e.stop()),n()}},[]),i},ix={any:0,all:1};function ib(e,t){let[i,r]=(0,o.useState)(!1),n=(0,o.useRef)(void 0),s=V.fun(e)&&e,{to:a={},from:l={},...u}=s?s():{},f=s?t:e,[c,d]=iu(()=>({from:l,...u}),[]);return(e1(()=>{let e=n.current,{root:t,once:s,amount:o="any",...u}=f??{};if(!e||s&&i||"u"<typeof IntersectionObserver)return;let c=new WeakMap,h=new IntersectionObserver(e=>{e.forEach(e=>{let t=c.get(e.target);if(!!t!==e.isIntersecting)if(e.isIntersecting){let t=(a&&d.start(a),r(!0),s?void 0:()=>{l&&d.start(l),r(!1)});V.fun(t)?c.set(e.target,t):h.unobserve(e.target)}else t&&(t(),c.delete(e.target))})},{root:t&&t.current||void 0,threshold:"number"==typeof o||Array.isArray(o)?o:ix[o],...u});return h.observe(e),()=>h.unobserve(e)},[f]),s)?[n,c]:[n,i]}function iw({children:e,...t}){return e(iu(t))}function i_({items:e,children:t,...i}){let r=ip(e.length,i);return e.map((e,i)=>{let n=t(e,i);return V.fun(n)?n(r[i]):n})}function iS({items:e,children:t,...i}){return im(e,i)(t)}var iA=class extends tW{constructor(e,t){super(),this.source=e,this.idle=!0,this._active=new Set,this.calc=ey(...t);const i=this._get();e9(this,to(i).create(i))}advance(e){let t=this._get();U(t,this.get())||(e6(this).setValue(t),this._onChange(t,this.idle)),!this.idle&&iE(this._active)&&iP(this)}_get(){let e=V.arr(this.source)?this.source.map(e_):O(e_(this.source));return this.calc(...e)}_start(){if(this.idle&&!iE(this._active)){let e;this.idle=!1,e=e7(this),e.forEach(e=>{e.done=!1}),j.skipAnimation?(d.batchedUpdates(()=>this.advance()),iP(this)):X.start(this)}}_attach(){let e,t,i=1;e=O(this.source),t=e=>{ew(e)&&eP(e,this),e instanceof tW&&(e.idle||this._active.add(e),i=Math.max(i,e.priority+1))},e.forEach(t),this.priority=i,this._start()}_detach(){let e,t;e=O(this.source),t=e=>{ew(e)&&eC(e,this)},e.forEach(t),this._active.clear(),iP(this)}eventObserved(e){"change"==e.type?e.idle?this.advance():(this._active.add(e.parent),this._start()):"idle"==e.type?this._active.delete(e.parent):"priority"==e.type&&(this.priority=O(this.source).reduce((e,t)=>Math.max(e,(t instanceof tW?t.priority:0)+1),0))}};function iM(e){return!1!==e.idle}function iE(e){return!e.size||Array.from(e).every(iM)}function iP(e){if(!e.idle){let t;e.idle=!0,t=e7(e),t.forEach(e=>{e.done=!0}),eA(e,{type:"idle",parent:e})}}var iC=(e,...t)=>new iA(e,t),iz=(e,...t)=>(eG(),new iA(e,t));j.assign({createStringInterpolator:eL,to:(e,t)=>new iA(e,t)});var ij=X.advance;e.s(["BailSignal",()=>tD,"Controller",()=>t6,"FrameValue",()=>tW,"Interpolation",()=>iA,"Spring",()=>iw,"SpringContext",()=>ia,"SpringRef",()=>io,"SpringValue",()=>tZ,"Trail",()=>i_,"Transition",()=>iS,"config",()=>tC,"inferTo",()=>tw,"interpolate",()=>iz,"to",()=>iC,"update",()=>ij,"useChain",()=>tP,"useInView",()=>ib,"useResize",()=>iy,"useScroll",()=>ig,"useSpring",()=>iu,"useSpringRef",()=>id,"useSpringValue",()=>ih,"useSprings",()=>il,"useTrail",()=>ip,"useTransition",()=>im],3540);var ik=["primitive"].concat(Object.keys(e.i(56346)).filter(e=>/^[A-Z]/.test(e)).map(e=>e[0].toLowerCase()+e.slice(1)));j.assign({createStringInterpolator:eL,colors:{transparent:0,aliceblue:0xf0f8ffff,antiquewhite:0xfaebd7ff,aqua:0xffffff,aquamarine:0x7fffd4ff,azure:0xf0ffffff,beige:0xf5f5dcff,bisque:0xffe4c4ff,black:255,blanchedalmond:0xffebcdff,blue:65535,blueviolet:0x8a2be2ff,brown:0xa52a2aff,burlywood:0xdeb887ff,burntsienna:0xea7e5dff,cadetblue:0x5f9ea0ff,chartreuse:0x7fff00ff,chocolate:0xd2691eff,coral:0xff7f50ff,cornflowerblue:0x6495edff,cornsilk:0xfff8dcff,crimson:0xdc143cff,cyan:0xffffff,darkblue:35839,darkcyan:9145343,darkgoldenrod:0xb8860bff,darkgray:0xa9a9a9ff,darkgreen:6553855,darkgrey:0xa9a9a9ff,darkkhaki:0xbdb76bff,darkmagenta:0x8b008bff,darkolivegreen:0x556b2fff,darkorange:0xff8c00ff,darkorchid:0x9932ccff,darkred:0x8b0000ff,darksalmon:0xe9967aff,darkseagreen:0x8fbc8fff,darkslateblue:0x483d8bff,darkslategray:0x2f4f4fff,darkslategrey:0x2f4f4fff,darkturquoise:0xced1ff,darkviolet:0x9400d3ff,deeppink:0xff1493ff,deepskyblue:0xbfffff,dimgray:0x696969ff,dimgrey:0x696969ff,dodgerblue:0x1e90ffff,firebrick:0xb22222ff,floralwhite:0xfffaf0ff,forestgreen:0x228b22ff,fuchsia:0xff00ffff,gainsboro:0xdcdcdcff,ghostwhite:0xf8f8ffff,gold:0xffd700ff,goldenrod:0xdaa520ff,gray:0x808080ff,green:8388863,greenyellow:0xadff2fff,grey:0x808080ff,honeydew:0xf0fff0ff,hotpink:0xff69b4ff,indianred:0xcd5c5cff,indigo:0x4b0082ff,ivory:0xfffff0ff,khaki:0xf0e68cff,lavender:0xe6e6faff,lavenderblush:0xfff0f5ff,lawngreen:0x7cfc00ff,lemonchiffon:0xfffacdff,lightblue:0xadd8e6ff,lightcoral:0xf08080ff,lightcyan:0xe0ffffff,lightgoldenrodyellow:0xfafad2ff,lightgray:0xd3d3d3ff,lightgreen:0x90ee90ff,lightgrey:0xd3d3d3ff,lightpink:0xffb6c1ff,lightsalmon:0xffa07aff,lightseagreen:0x20b2aaff,lightskyblue:0x87cefaff,lightslategray:0x778899ff,lightslategrey:0x778899ff,lightsteelblue:0xb0c4deff,lightyellow:0xffffe0ff,lime:0xff00ff,limegreen:0x32cd32ff,linen:0xfaf0e6ff,magenta:0xff00ffff,maroon:0x800000ff,mediumaquamarine:0x66cdaaff,mediumblue:52735,mediumorchid:0xba55d3ff,mediumpurple:0x9370dbff,mediumseagreen:0x3cb371ff,mediumslateblue:0x7b68eeff,mediumspringgreen:0xfa9aff,mediumturquoise:0x48d1ccff,mediumvioletred:0xc71585ff,midnightblue:0x191970ff,mintcream:0xf5fffaff,mistyrose:0xffe4e1ff,moccasin:0xffe4b5ff,navajowhite:0xffdeadff,navy:33023,oldlace:0xfdf5e6ff,olive:0x808000ff,olivedrab:0x6b8e23ff,orange:0xffa500ff,orangered:0xff4500ff,orchid:0xda70d6ff,palegoldenrod:0xeee8aaff,palegreen:0x98fb98ff,paleturquoise:0xafeeeeff,palevioletred:0xdb7093ff,papayawhip:0xffefd5ff,peachpuff:0xffdab9ff,peru:0xcd853fff,pink:0xffc0cbff,plum:0xdda0ddff,powderblue:0xb0e0e6ff,purple:0x800080ff,rebeccapurple:0x663399ff,red:0xff0000ff,rosybrown:0xbc8f8fff,royalblue:0x4169e1ff,saddlebrown:0x8b4513ff,salmon:0xfa8072ff,sandybrown:0xf4a460ff,seagreen:0x2e8b57ff,seashell:0xfff5eeff,sienna:0xa0522dff,silver:0xc0c0c0ff,skyblue:0x87ceebff,slateblue:0x6a5acdff,slategray:0x708090ff,slategrey:0x708090ff,snow:0xfffafaff,springgreen:0xff7fff,steelblue:0x4682b4ff,tan:0xd2b48cff,teal:8421631,thistle:0xd8bfd8ff,tomato:0xff6347ff,turquoise:0x40e0d0ff,violet:0xee82eeff,wheat:0xf5deb3ff,white:0xffffffff,whitesmoke:0xf5f5f5ff,yellow:0xffff00ff,yellowgreen:0x9acd32ff},frameLoop:"demand"}),(0,f.j)(()=>{d.advance()});var iR=((e,{applyAnimatedValues:t=()=>!1,createAnimatedStyle:i=e=>new tn(e),getComponentProps:r=e=>e}={})=>{let n={applyAnimatedValues:t,createAnimatedStyle:i,getComponentProps:r},s=e=>{let t=tc(e)||"Anonymous";return(e=V.str(e)?s[e]||(s[e]=tl(e,n)):e[tf]||(e[tf]=tl(e,n))).displayName=`Animated(${t})`,e};return T(e,(t,i)=>{V.arr(e)&&(i=tc(t)),s[i]=s(t)}),{animated:s}})(ik,{applyAnimatedValues:u.applyProps}).animated;e.i(3540),e.i(87918);var iF=e.i(35259),iV=e.i(3626);function iU({position:e,count:t=100,color:i="#ffffff",size:r=.05,lifetime:n=2,spread:s=1,velocity:u=1,type:f="dust"}){let c=(0,o.useRef)(null),d=(0,o.useRef)(Date.now()),h=(0,o.useMemo)(()=>new iV.ShaderMaterial({uniforms:{uTime:{value:0},uColor:{value:new iV.Color(i)},uSize:{value:r},uOpacity:{value:1}},vertexShader:`
        uniform float uTime;
        uniform float uSize;
        
        attribute float aLifetime;
        attribute vec3 aVelocity;
        attribute float aDelay;
        
        varying float vAlpha;
        
        void main() {
          float age = max(0.0, uTime - aDelay);
          float lifeProgress = age / aLifetime;
          
          // Fade out at end of lifetime
          vAlpha = 1.0 - smoothstep(0.7, 1.0, lifeProgress);
          
          // Move particles based on velocity
          vec3 pos = position + aVelocity * age;
          
          // Add gravity for dust
          pos.y -= 0.5 * age * age * 0.5;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size decreases over time
          gl_PointSize = uSize * (300.0 / -mvPosition.z) * (1.0 - lifeProgress * 0.5);
        }
      `,fragmentShader:`
        uniform vec3 uColor;
        uniform float uOpacity;
        
        varying float vAlpha;
        
        void main() {
          // Circular particle shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Soft edges
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= vAlpha * uOpacity;
          
          // Glow effect for sparkles
          ${"sparkle"===f?"alpha *= 1.5;":""}
          
          gl_FragColor = vec4(uColor, alpha);
        }
      `,transparent:!0,blending:iV.AdditiveBlending,depthWrite:!1}),[i,r,f]),p=(0,o.useMemo)(()=>{let e=new Float32Array(3*t),i=new Float32Array(3*t),r=new Float32Array(t),a=new Float32Array(t);for(let o=0;o<t;o++){let t=3*o;e[t]=(Math.random()-.5)*s,e[t+1]=Math.random()*s*.5,e[t+2]=(Math.random()-.5)*s;let l=Math.random()*Math.PI*2,f=u*(.5+.5*Math.random());i[t]=Math.cos(l)*f,i[t+1]=Math.random()*f*2,i[t+2]=Math.sin(l)*f,r[o]=n*(.8+.4*Math.random()),a[o]=.5*Math.random()}return{positions:e,velocities:i,lifetimes:r,delays:a}},[t,s,u,n]);return(0,l.useFrame)(e=>{if(!c.current)return;let t=(Date.now()-d.current)/1e3;h.uniforms.uTime.value=t,t>n+1&&(h.uniforms.uOpacity.value=Math.max(0,1-(t-n-1)))}),(0,a.jsx)("points",{ref:c,position:e,material:h,children:(0,a.jsxs)("bufferGeometry",{children:[(0,a.jsx)("bufferAttribute",{attach:"attributes-position",count:t,array:p.positions,itemSize:3,args:[p.positions,3]}),(0,a.jsx)("bufferAttribute",{attach:"attributes-aVelocity",count:t,array:p.velocities,itemSize:3,args:[p.velocities,3]}),(0,a.jsx)("bufferAttribute",{attach:"attributes-aLifetime",count:t,array:p.lifetimes,itemSize:1,args:[p.lifetimes,1]}),(0,a.jsx)("bufferAttribute",{attach:"attributes-aDelay",count:t,array:p.delays,itemSize:1,args:[p.delays,1]})]})})}function iT({position:e,height:t=2,color:i="#4A90E2",delay:r=0,onComplete:n}){let s=(0,o.useRef)(null),u=(0,o.useRef)(null),f=(0,o.useRef)(null),[c,d]=(0,o.useState)(!1),[h,p]=(0,o.useState)(!1),[m,v]=(0,o.useState)(!0),[g,y]=iu(()=>({scale:0,config:{tension:120,friction:14}}));return(0,o.useEffect)(()=>{if(!s.current||!u.current||!f.current)return;let i=iF.default.timeline({delay:r,onComplete:()=>{v(!1),n?.()}});return i.fromTo(f.current.position,{y:t+3},{y:t,duration:.5,ease:"power2.inOut"}),i.to(u.current.scale,{y:1,duration:1.5,ease:"power2.out",onStart:()=>d(!0),onUpdate:function(){f.current&&u.current&&(f.current.position.y=e[1]+t*u.current.scale.y+.5)}},"-=0.2"),i.call(()=>p(!0)),i.to(f.current.position,{y:t+5,duration:.6,ease:"power2.in"}),i.call(()=>{y.start({scale:1})}),()=>{i.kill()}},[r,t,e,n,y]),(0,l.useFrame)(e=>{if(!u.current)return;let t=e.clock.getElapsedTime(),i=u.current.material;i.emissive&&(i.emissiveIntensity=.2+.1*Math.sin(3*t))}),(0,a.jsxs)("group",{ref:s,position:e,children:[(0,a.jsxs)(iR.mesh,{ref:u,position:[0,t/2,0],castShadow:!0,receiveShadow:!0,"scale-y":0,"scale-x":g.scale,"scale-z":g.scale,children:[(0,a.jsx)("boxGeometry",{args:[.8,t,.8]}),(0,a.jsx)("meshStandardMaterial",{color:i,emissive:i,emissiveIntensity:.2,metalness:.3,roughness:.4})]}),m&&(0,a.jsxs)("group",{ref:f,position:[0,t+3,0],children:[(0,a.jsxs)("mesh",{position:[0,0,0],children:[(0,a.jsx)("boxGeometry",{args:[1.5,.05,.05]}),(0,a.jsx)("meshStandardMaterial",{color:"#FFD700",metalness:.8})]}),(0,a.jsxs)("mesh",{position:[0,-.5,0],children:[(0,a.jsx)("cylinderGeometry",{args:[.03,.03,1,8]}),(0,a.jsx)("meshStandardMaterial",{color:"#888888"})]}),(0,a.jsxs)("mesh",{position:[0,-1,0],children:[(0,a.jsx)("cylinderGeometry",{args:[.01,.01,1,6]}),(0,a.jsx)("meshStandardMaterial",{color:"#333333"})]}),(0,a.jsxs)("mesh",{position:[.7,.1,0],children:[(0,a.jsx)("sphereGeometry",{args:[.05,8,8]}),(0,a.jsx)("meshStandardMaterial",{color:"#FF0000",emissive:"#FF0000",emissiveIntensity:1})]})]}),c&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(iU,{position:[0,0,0],count:150,color:"#8B7355",size:.08,lifetime:1.5,spread:1.2,velocity:.5,type:"dust"}),(0,a.jsx)(iU,{position:[.4,0,.4],count:100,color:"#A0826D",size:.06,lifetime:1.8,spread:.8,velocity:.4,type:"smoke"})]}),h&&(0,a.jsx)(iU,{position:[0,t,0],count:80,color:"#FFD700",size:.1,lifetime:1.2,spread:1,velocity:1.5,type:"sparkle"})]})}e.s(["ParticleSystem",()=>iU],84085),e.s(["BuildingSpawnCinematic",()=>iT],39584)},87226,e=>{"use strict";var t=e.i(31352),i=e.i(10278),r=e.i(87253),n=e.i(44440),s=e.i(3626),a=s,o=e.i(77863),l=Object.defineProperty,u=(e,t,i)=>{let r;return(r="symbol"!=typeof t?t+"":t)in e?l(e,r,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[r]=i,i};function f(e,t,i,r,n){let s;if(e=e.subarray||e.slice?e:e.buffer,i=i.subarray||i.slice?i:i.buffer,e=t?e.subarray?e.subarray(t,n&&t+n):e.slice(t,n&&t+n):e,i.set)i.set(e,r);else for(s=0;s<e.length;s++)i[s+r]=e[s];return i}class c extends a.BufferGeometry{constructor(){super(),u(this,"type","MeshLine"),u(this,"isMeshLine",!0),u(this,"positions",[]),u(this,"previous",[]),u(this,"next",[]),u(this,"side",[]),u(this,"width",[]),u(this,"indices_array",[]),u(this,"uvs",[]),u(this,"counters",[]),u(this,"widthCallback",null),u(this,"_attributes"),u(this,"_points",[]),u(this,"points"),u(this,"matrixWorld",new a.Matrix4),Object.defineProperties(this,{points:{enumerable:!0,get(){return this._points},set(e){this.setPoints(e,this.widthCallback)}}})}setMatrixWorld(e){this.matrixWorld=e}setPoints(e,t){var i;if(e=(i=e)instanceof Float32Array?i:i instanceof a.BufferGeometry?i.getAttribute("position").array:i.map(e=>{let t=Array.isArray(e);return e instanceof a.Vector3?[e.x,e.y,e.z]:e instanceof a.Vector2?[e.x,e.y,0]:t&&3===e.length?[e[0],e[1],e[2]]:t&&2===e.length?[e[0],e[1],0]:e}).flat(),this._points=e,this.widthCallback=null!=t?t:null,this.positions=[],this.counters=[],e.length&&e[0]instanceof a.Vector3)for(let t=0;t<e.length;t++){let i=e[t],r=t/(e.length-1);this.positions.push(i.x,i.y,i.z),this.positions.push(i.x,i.y,i.z),this.counters.push(r),this.counters.push(r)}else for(let t=0;t<e.length;t+=3){let i=t/(e.length-1);this.positions.push(e[t],e[t+1],e[t+2]),this.positions.push(e[t],e[t+1],e[t+2]),this.counters.push(i),this.counters.push(i)}this.process()}compareV3(e,t){let i=6*e,r=6*t;return this.positions[i]===this.positions[r]&&this.positions[i+1]===this.positions[r+1]&&this.positions[i+2]===this.positions[r+2]}copyV3(e){let t=6*e;return[this.positions[t],this.positions[t+1],this.positions[t+2]]}process(){let e,t,i=this.positions.length/6;this.previous=[],this.next=[],this.side=[],this.width=[],this.indices_array=[],this.uvs=[],t=this.compareV3(0,i-1)?this.copyV3(i-2):this.copyV3(0),this.previous.push(t[0],t[1],t[2]),this.previous.push(t[0],t[1],t[2]);for(let r=0;r<i;r++){if(this.side.push(1),this.side.push(-1),e=this.widthCallback?this.widthCallback(r/(i-1)):1,this.width.push(e),this.width.push(e),this.uvs.push(r/(i-1),0),this.uvs.push(r/(i-1),1),r<i-1){t=this.copyV3(r),this.previous.push(t[0],t[1],t[2]),this.previous.push(t[0],t[1],t[2]);let e=2*r;this.indices_array.push(e,e+1,e+2),this.indices_array.push(e+2,e+1,e+3)}r>0&&(t=this.copyV3(r),this.next.push(t[0],t[1],t[2]),this.next.push(t[0],t[1],t[2]))}t=this.compareV3(i-1,0)?this.copyV3(1):this.copyV3(i-1),this.next.push(t[0],t[1],t[2]),this.next.push(t[0],t[1],t[2]),this._attributes&&this._attributes.position.count===this.counters.length?(this._attributes.position.copyArray(new Float32Array(this.positions)),this._attributes.position.needsUpdate=!0,this._attributes.previous.copyArray(new Float32Array(this.previous)),this._attributes.previous.needsUpdate=!0,this._attributes.next.copyArray(new Float32Array(this.next)),this._attributes.next.needsUpdate=!0,this._attributes.side.copyArray(new Float32Array(this.side)),this._attributes.side.needsUpdate=!0,this._attributes.width.copyArray(new Float32Array(this.width)),this._attributes.width.needsUpdate=!0,this._attributes.uv.copyArray(new Float32Array(this.uvs)),this._attributes.uv.needsUpdate=!0,this._attributes.index.copyArray(new Uint16Array(this.indices_array)),this._attributes.index.needsUpdate=!0):this._attributes={position:new a.BufferAttribute(new Float32Array(this.positions),3),previous:new a.BufferAttribute(new Float32Array(this.previous),3),next:new a.BufferAttribute(new Float32Array(this.next),3),side:new a.BufferAttribute(new Float32Array(this.side),1),width:new a.BufferAttribute(new Float32Array(this.width),1),uv:new a.BufferAttribute(new Float32Array(this.uvs),2),index:new a.BufferAttribute(new Uint16Array(this.indices_array),1),counters:new a.BufferAttribute(new Float32Array(this.counters),1)},this.setAttribute("position",this._attributes.position),this.setAttribute("previous",this._attributes.previous),this.setAttribute("next",this._attributes.next),this.setAttribute("side",this._attributes.side),this.setAttribute("width",this._attributes.width),this.setAttribute("uv",this._attributes.uv),this.setAttribute("counters",this._attributes.counters),this.setAttribute("position",this._attributes.position),this.setAttribute("previous",this._attributes.previous),this.setAttribute("next",this._attributes.next),this.setAttribute("side",this._attributes.side),this.setAttribute("width",this._attributes.width),this.setAttribute("uv",this._attributes.uv),this.setAttribute("counters",this._attributes.counters),this.setIndex(this._attributes.index),this.computeBoundingSphere(),this.computeBoundingBox()}advance({x:e,y:t,z:i}){let r=this._attributes.position.array,n=this._attributes.previous.array,s=this._attributes.next.array,a=r.length;f(r,0,n,0,a),f(r,6,r,0,a-6),r[a-6]=e,r[a-5]=t,r[a-4]=i,r[a-3]=e,r[a-2]=t,r[a-1]=i,f(r,6,s,0,a-6),s[a-6]=e,s[a-5]=t,s[a-4]=i,s[a-3]=e,s[a-2]=t,s[a-1]=i,this._attributes.position.needsUpdate=!0,this._attributes.previous.needsUpdate=!0,this._attributes.next.needsUpdate=!0}}let d=`
  #include <common>
  #include <logdepthbuf_pars_vertex>
  #include <fog_pars_vertex>
  #include <clipping_planes_pars_vertex>

  attribute vec3 previous;
  attribute vec3 next;
  attribute float side;
  attribute float width;
  attribute float counters;
  
  uniform vec2 resolution;
  uniform float lineWidth;
  uniform vec3 color;
  uniform float opacity;
  uniform float sizeAttenuation;
  
  varying vec2 vUV;
  varying vec4 vColor;
  varying float vCounters;
  
  vec2 fix(vec4 i, float aspect) {
    vec2 res = i.xy / i.w;
    res.x *= aspect;
    return res;
  }
  
  void main() {
    float aspect = resolution.x / resolution.y;
    vColor = vec4(color, opacity);
    vUV = uv;
    vCounters = counters;
  
    mat4 m = projectionMatrix * modelViewMatrix;
    vec4 finalPosition = m * vec4(position, 1.0) * aspect;
    vec4 prevPos = m * vec4(previous, 1.0);
    vec4 nextPos = m * vec4(next, 1.0);
  
    vec2 currentP = fix(finalPosition, aspect);
    vec2 prevP = fix(prevPos, aspect);
    vec2 nextP = fix(nextPos, aspect);
  
    float w = lineWidth * width;
  
    vec2 dir;
    if (nextP == currentP) dir = normalize(currentP - prevP);
    else if (prevP == currentP) dir = normalize(nextP - currentP);
    else {
      vec2 dir1 = normalize(currentP - prevP);
      vec2 dir2 = normalize(nextP - currentP);
      dir = normalize(dir1 + dir2);
  
      vec2 perp = vec2(-dir1.y, dir1.x);
      vec2 miter = vec2(-dir.y, dir.x);
      //w = clamp(w / dot(miter, perp), 0., 4. * lineWidth * width);
    }
  
    //vec2 normal = (cross(vec3(dir, 0.), vec3(0., 0., 1.))).xy;
    vec4 normal = vec4(-dir.y, dir.x, 0., 1.);
    normal.xy *= .5 * w;
    //normal *= projectionMatrix;
    if (sizeAttenuation == 0.) {
      normal.xy *= finalPosition.w;
      normal.xy /= (vec4(resolution, 0., 1.) * projectionMatrix).xy * aspect;
    }
  
    finalPosition.xy += normal.xy * side;
    gl_Position = finalPosition;
    #include <logdepthbuf_vertex>
    #include <fog_vertex>
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    #include <clipping_planes_vertex>
    #include <fog_vertex>
  }
`,h=parseInt(a.REVISION.replace(/\D+/g,"")),p=`
  #include <fog_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>
  
  uniform sampler2D map;
  uniform sampler2D alphaMap;
  uniform float useGradient;
  uniform float useMap;
  uniform float useAlphaMap;
  uniform float useDash;
  uniform float dashArray;
  uniform float dashOffset;
  uniform float dashRatio;
  uniform float visibility;
  uniform float alphaTest;
  uniform vec2 repeat;
  uniform vec3 gradient[2];
  
  varying vec2 vUV;
  varying vec4 vColor;
  varying float vCounters;
  
  void main() {
    #include <logdepthbuf_fragment>
    vec4 diffuseColor = vColor;
    if (useGradient == 1.) diffuseColor = vec4(mix(gradient[0], gradient[1], vCounters), 1.0);
    if (useMap == 1.) diffuseColor *= texture2D(map, vUV * repeat);
    if (useAlphaMap == 1.) diffuseColor.a *= texture2D(alphaMap, vUV * repeat).a;
    if (diffuseColor.a < alphaTest) discard;
    if (useDash == 1.) diffuseColor.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));
    diffuseColor.a *= step(vCounters, visibility);
    #include <clipping_planes_fragment>
    gl_FragColor = diffuseColor;     
    #include <fog_fragment>
    #include <tonemapping_fragment>
    #include <${h>=154?"colorspace_fragment":"encodings_fragment"}>
  }
`;class m extends a.ShaderMaterial{constructor(e){super({uniforms:{...o.UniformsLib.fog,lineWidth:{value:1},map:{value:null},useMap:{value:0},alphaMap:{value:null},useAlphaMap:{value:0},color:{value:new a.Color(0xffffff)},gradient:{value:[new a.Color(0xff0000),new a.Color(65280)]},opacity:{value:1},resolution:{value:new a.Vector2(1,1)},sizeAttenuation:{value:1},dashArray:{value:0},dashOffset:{value:0},dashRatio:{value:.5},useDash:{value:0},useGradient:{value:0},visibility:{value:1},alphaTest:{value:0},repeat:{value:new a.Vector2(1,1)}},vertexShader:d,fragmentShader:p}),u(this,"lineWidth"),u(this,"map"),u(this,"useMap"),u(this,"alphaMap"),u(this,"useAlphaMap"),u(this,"color"),u(this,"gradient"),u(this,"resolution"),u(this,"sizeAttenuation"),u(this,"dashArray"),u(this,"dashOffset"),u(this,"dashRatio"),u(this,"useDash"),u(this,"useGradient"),u(this,"visibility"),u(this,"repeat"),this.type="MeshLineMaterial",Object.defineProperties(this,{lineWidth:{enumerable:!0,get(){return this.uniforms.lineWidth.value},set(e){this.uniforms.lineWidth.value=e}},map:{enumerable:!0,get(){return this.uniforms.map.value},set(e){this.uniforms.map.value=e}},useMap:{enumerable:!0,get(){return this.uniforms.useMap.value},set(e){this.uniforms.useMap.value=e}},alphaMap:{enumerable:!0,get(){return this.uniforms.alphaMap.value},set(e){this.uniforms.alphaMap.value=e}},useAlphaMap:{enumerable:!0,get(){return this.uniforms.useAlphaMap.value},set(e){this.uniforms.useAlphaMap.value=e}},color:{enumerable:!0,get(){return this.uniforms.color.value},set(e){this.uniforms.color.value=e}},gradient:{enumerable:!0,get(){return this.uniforms.gradient.value},set(e){this.uniforms.gradient.value=e}},opacity:{enumerable:!0,get(){return this.uniforms.opacity.value},set(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get(){return this.uniforms.resolution.value},set(e){this.uniforms.resolution.value.copy(e)}},sizeAttenuation:{enumerable:!0,get(){return this.uniforms.sizeAttenuation.value},set(e){this.uniforms.sizeAttenuation.value=e}},dashArray:{enumerable:!0,get(){return this.uniforms.dashArray.value},set(e){this.uniforms.dashArray.value=e,this.useDash=+(0!==e)}},dashOffset:{enumerable:!0,get(){return this.uniforms.dashOffset.value},set(e){this.uniforms.dashOffset.value=e}},dashRatio:{enumerable:!0,get(){return this.uniforms.dashRatio.value},set(e){this.uniforms.dashRatio.value=e}},useDash:{enumerable:!0,get(){return this.uniforms.useDash.value},set(e){this.uniforms.useDash.value=e}},useGradient:{enumerable:!0,get(){return this.uniforms.useGradient.value},set(e){this.uniforms.useGradient.value=e}},visibility:{enumerable:!0,get(){return this.uniforms.visibility.value},set(e){this.uniforms.visibility.value=e}},alphaTest:{enumerable:!0,get(){return this.uniforms.alphaTest.value},set(e){this.uniforms.alphaTest.value=e}},repeat:{enumerable:!0,get(){return this.uniforms.repeat.value},set(e){this.uniforms.repeat.value.copy(e)}}}),this.setValues(e)}copy(e){return super.copy(e),this.lineWidth=e.lineWidth,this.map=e.map,this.useMap=e.useMap,this.alphaMap=e.alphaMap,this.useAlphaMap=e.useAlphaMap,this.color.copy(e.color),this.gradient=e.gradient,this.opacity=e.opacity,this.resolution.copy(e.resolution),this.sizeAttenuation=e.sizeAttenuation,this.dashArray=e.dashArray,this.dashOffset=e.dashOffset,this.dashRatio=e.dashRatio,this.useDash=e.useDash,this.useGradient=e.useGradient,this.visibility=e.visibility,this.alphaTest=e.alphaTest,this.repeat.copy(e.repeat),this}}let v={width:.2,length:1,decay:1,local:!1,stride:0,interval:1},g=(e,t=1)=>(e.set(e.subarray(t)),e.fill(-1/0,-t),e),y=n.forwardRef((e,a)=>{let{children:o}=e,{width:l,length:u,decay:f,local:d,stride:h,interval:p}={...v,...e},{color:y="hotpink",attenuation:x,target:b}=e,w=(0,i.useThree)(e=>e.size),_=(0,i.useThree)(e=>e.scene),S=n.useRef(null),[A,M]=n.useState(null),E=function(e,i){let{length:r,local:a,decay:o,interval:l,stride:u}={...v,...i},f=n.useRef(null),[c]=n.useState(()=>new s.Vector3);n.useLayoutEffect(()=>{e&&(f.current=Float32Array.from({length:10*r*3},(t,i)=>e.position.getComponent(i%3)))},[r,e]);let d=n.useRef(new s.Vector3),h=n.useRef(0);return(0,t.useFrame)(()=>{if(e&&f.current){if(0===h.current){let t;a?t=e.position:(e.getWorldPosition(c),t=c);let i=+o;for(let e=0;e<i;e++)t.distanceTo(d.current)<u||(g(f.current,3),f.current.set(t.toArray(),f.current.length-3));d.current.copy(t)}h.current++,h.current=h.current%l}}),f}(A,{length:u,decay:f,local:d,stride:h,interval:p});n.useEffect(()=>{let e=(null==b?void 0:b.current)||S.current.children.find(e=>e instanceof s.Object3D);e&&M(e)},[E,b]);let P=n.useMemo(()=>new c,[]),C=n.useMemo(()=>{var e,t;let i,r=new m({lineWidth:.1*l,color:y,sizeAttenuation:1,resolution:new s.Vector2(w.width,w.height)});return o&&(Array.isArray(o)?i=o.find(e=>"string"==typeof e.type&&"meshLineMaterial"===e.type):"string"==typeof o.type&&"meshLineMaterial"===o.type&&(i=o)),"object"==typeof(null==(e=i)?void 0:e.props)&&(null==(t=i)?void 0:t.props)!==null&&r.setValues(i.props),r},[l,y,w,o]);return n.useEffect(()=>{C.uniforms.resolution.value.set(w.width,w.height)},[w]),(0,t.useFrame)(()=>{E.current&&P.setPoints(E.current,x)}),n.createElement("group",null,(0,r.createPortal)(n.createElement("mesh",{ref:a,geometry:P,material:C}),_),n.createElement("group",{ref:S},o))});e.s(["Trail",()=>y],87226)},38999,93665,7468,90730,e=>{"use strict";var t=e.i(87433),i=e.i(44440),r=e.i(31352),n=e.i(9239),s=e.i(87226),a=e.i(58591),o=e.i(3626),l=e.i(35259),u=e.i(84085);function f({points:e,color:f="#FF6B35",delay:d=0,onComplete:h}){let p=(0,i.useRef)(null),m=(0,i.useRef)(null),[v,g]=(0,i.useState)([]),[y,x]=(0,i.useState)(-1),[b,w]=(0,i.useState)(!1),_=e.map(e=>new o.Vector3(e[0],e[1],e[2])),S=Array.from({length:Math.max(2,Math.floor(e.length/3))},(t,i)=>Math.floor((e.length-1)*i/(Math.max(2,Math.floor(e.length/3))-1)));return(0,i.useEffect)(()=>{let e=l.default.timeline({delay:d,onComplete:h});return e.to({progress:0},{progress:1,duration:2.5,ease:"power1.inOut",onUpdate:function(){let e=Math.floor(this.targets()[0].progress*_.length);g(_.slice(0,e));for(let t=0;t<S.length;t++)e>=S[t]&&y<t&&x(t)}}),e.call(()=>w(!0),[],"+=0.5"),()=>{e.kill()}},[d,_.length,h]),(0,r.useFrame)(t=>{if(!m.current||v.length<_.length)return;let i=Math.floor(.3*t.clock.getElapsedTime()%1*(e.length-1));if(i<e.length){let t=e[i];m.current.position.set(t[0],t[1]+.1,t[2])}}),(0,t.jsxs)("group",{ref:p,children:[v.length>1&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.Line,{points:v,color:f,lineWidth:3}),(0,t.jsx)(n.Line,{points:v,color:"#FFFFFF",lineWidth:6,transparent:!0,opacity:.3})]}),S.map((i,r)=>{if(r>y)return null;let n=e[i],s=r===y;return(0,t.jsxs)("group",{position:n,children:[(0,t.jsx)(a.Sphere,{args:[.2,16,16],position:[0,0,0],children:(0,t.jsx)("meshStandardMaterial",{color:f,emissive:f,emissiveIntensity:s?1.5:.5,metalness:.8,roughness:.2})}),(0,t.jsxs)("mesh",{position:[0,.3,0],children:[(0,t.jsx)("cylinderGeometry",{args:[.05,.05,.4,8]}),(0,t.jsx)("meshStandardMaterial",{color:"#888888"})]}),s&&(0,t.jsx)(u.ParticleSystem,{position:[0,0,0],count:60,color:"#FFFF00",size:.08,lifetime:1,spread:.6,velocity:1.2,type:"sparkle"})]},r)}),b&&v.length>=_.length&&(0,t.jsx)(c,{points:e,color:f}),v.length>=_.length&&(0,t.jsx)("group",{ref:m,children:(0,t.jsx)(s.Trail,{width:.3,length:2,color:f,attenuation:e=>e,children:(0,t.jsxs)("mesh",{children:[(0,t.jsx)("boxGeometry",{args:[.15,.1,.15]}),(0,t.jsx)("meshStandardMaterial",{color:f,emissive:f,emissiveIntensity:1})]})})})]})}function c({points:e,color:n}){let s=(0,i.useRef)(null);return(0,r.useFrame)(t=>{if(!s.current)return;let i=Math.floor(.5*t.clock.getElapsedTime()%1*(e.length-1));if(i<e.length){let t=e[i];s.current.position.set(t[0],t[1],t[2])}}),(0,t.jsx)("group",{ref:s,children:(0,t.jsx)(a.Sphere,{args:[.15,16,16],children:(0,t.jsx)("meshStandardMaterial",{color:"#FFFFFF",emissive:n,emissiveIntensity:2,transparent:!0,opacity:.8})})})}function d({position:e,size:n=2,delay:s=0,onComplete:a}){let f=(0,i.useRef)(null),c=(0,i.useRef)(null),[d,p]=(0,i.useState)(0),[m,v]=(0,i.useState)(!1),[g,y]=(0,i.useState)(!1),x=(0,i.useMemo)(()=>Array.from({length:16},(e,t)=>{let i=t/16*Math.PI*2,r=.35*n;return{x:Math.cos(i)*r,z:Math.sin(i)*r,delay:.04*t,size:.25+.15*Math.random()}}),[n]),b=(0,i.useMemo)(()=>Array.from({length:20},()=>({x:(Math.random()-.5)*n*.8,z:(Math.random()-.5)*n*.8,speed:.3+.2*Math.random(),angle:Math.random()*Math.PI*2})),[n]);return(0,i.useEffect)(()=>{let e=l.default.timeline({delay:s,onComplete:a});return e.to({progress:0},{progress:1,duration:2,ease:"power2.out",onUpdate:function(){p(this.targets()[0].progress)}}),e.call(()=>v(!0),[],"-=0.5"),e.call(()=>y(!0),[],"+=0.5"),()=>{e.kill()}},[s,a]),(0,r.useFrame)(e=>{if(!c.current||!g)return;let t=e.clock.getElapsedTime(),i=new o.Object3D;b.forEach((e,r)=>{let n=e.x+.3*Math.sin(t*e.speed+r),s=e.z+.3*Math.cos(t*e.speed+r);i.position.set(n,.05,s),i.scale.setScalar(.08),i.updateMatrix(),c.current.setMatrixAt(r,i.matrix)}),c.current.instanceMatrix.needsUpdate=!0}),(0,t.jsxs)("group",{ref:f,position:e,children:[(0,t.jsxs)("mesh",{position:[0,.01,0],receiveShadow:!0,children:[(0,t.jsx)("cylinderGeometry",{args:[n*d,n*d,.05,32]}),(0,t.jsx)("meshStandardMaterial",{color:"#2ECC71",roughness:.9,emissive:"#1a5c30",emissiveIntensity:.2*d})]}),x.map((e,i)=>{let r=Math.min(1.8*Math.max(0,d-e.delay),1);return r<=0?null:(0,t.jsxs)("mesh",{position:[e.x,.02,e.z],scale:r,receiveShadow:!0,children:[(0,t.jsx)("cylinderGeometry",{args:[n*e.size,n*e.size,.03,12]}),(0,t.jsx)("meshStandardMaterial",{color:"#27AE60",roughness:.95})]},i)}),[0,1,2,3].map(e=>{let i=e/4*Math.PI*2,r=.5*n,s=Math.min(2.5*Math.max(0,d-.3-.08*e),1);return s<=0?null:(0,t.jsxs)("group",{position:[Math.cos(i)*r,0,Math.sin(i)*r],scale:s,children:[(0,t.jsxs)("mesh",{position:[0,.2,0],castShadow:!0,children:[(0,t.jsx)("cylinderGeometry",{args:[.06,.08,.4,8]}),(0,t.jsx)("meshStandardMaterial",{color:"#654321",roughness:.9})]}),(0,t.jsxs)("mesh",{position:[0,.5,0],castShadow:!0,children:[(0,t.jsx)("sphereGeometry",{args:[.25,12,12]}),(0,t.jsx)("meshStandardMaterial",{color:"#228B22",emissive:"#0a2f0a",emissiveIntensity:.1})]}),(0,t.jsxs)("mesh",{position:[0,.65,0],castShadow:!0,children:[(0,t.jsx)("sphereGeometry",{args:[.18,10,10]}),(0,t.jsx)("meshStandardMaterial",{color:"#2a9d2a"})]})]},`tree-${e}`)}),m&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(u.ParticleSystem,{position:[0,.1,0],count:100,color:"#FFB6C1",size:.06,lifetime:2,spread:.8*n,velocity:.3,type:"sparkle"}),(0,t.jsx)(u.ParticleSystem,{position:[0,.1,0],count:80,color:"#FF69B4",size:.05,lifetime:2.5,spread:.6*n,velocity:.25,type:"sparkle"})]}),g&&(0,t.jsxs)("instancedMesh",{ref:c,args:[void 0,void 0,b.length],castShadow:!0,children:[(0,t.jsx)("sphereGeometry",{args:[1,8,8]}),(0,t.jsx)("meshStandardMaterial",{color:"#3498DB",emissive:"#2980B9",emissiveIntensity:.3})]}),g&&(0,t.jsx)(h,{size:n})]})}function h({size:e}){let n=(0,i.useRef)(null);return(0,r.useFrame)(e=>{if(!n.current)return;let t=e.clock.getElapsedTime();n.current.rotation.y=.2*t}),(0,t.jsx)("group",{ref:n,children:[0,1,2].map(i=>{let r=i/3*Math.PI*2,n=.6*e;return(0,t.jsx)(p,{position:[Math.cos(r)*n,.5+.2*Math.sin(2*r),Math.sin(r)*n],offset:i},i)})})}function p({position:e,offset:n}){let s=(0,i.useRef)(null);return(0,r.useFrame)(t=>{if(!s.current)return;let i=t.clock.getElapsedTime();s.current.position.y=e[1]+.15*Math.sin(2*i+n),s.current.rotation.z=.2*Math.sin(3*i+n)}),(0,t.jsxs)("mesh",{ref:s,position:e,children:[(0,t.jsx)("sphereGeometry",{args:[.04,6,6]}),(0,t.jsx)("meshStandardMaterial",{color:"#FFD700",emissive:"#FFA500",emissiveIntensity:.5})]})}e.s(["SubwayLineCinematic",()=>f],38999),e.s(["ParkGrowthCinematic",()=>d],93665);var m=e.i(10278);function v(){let{camera:e}=(0,m.useThree)(),t=(0,i.useRef)(0),n=(0,i.useRef)(new o.Vector3),s=(0,i.useRef)(!1);return(0,r.useFrame)(i=>{if(t.current>0){let i=t.current;s.current||(n.current.copy(e.position),s.current=!0),e.position.x=n.current.x+(Math.random()-.5)*i,e.position.y=n.current.y+(Math.random()-.5)*i,e.position.z=n.current.z+(Math.random()-.5)*i,t.current*=.92,t.current<.001&&(t.current=0,e.position.copy(n.current),s.current=!1)}}),{shake:(e=.1)=>{t.current=e}}}e.s(["useCameraShake",()=>v],7468);class g{context=null;enabled=!1;constructor(){this.context=new(window.AudioContext||window.webkitAudioContext)}enable(){this.enabled=!0,this.context?.resume()}disable(){this.enabled=!1}play(e,t=.3){if(!this.enabled||!this.context)return;let i=this.context.currentTime;switch(e){case"construction":this.playRumble(i,t,1.5);break;case"complete":this.playChime(i,t);break;case"crane":this.playCrane(i,t);break;case"train":this.playWhoosh(i,t,2);break;case"sparkle":this.playSparkle(i,t);break;case"crowd":this.playCrowd(i,t);break;case"nature":this.playNature(i,t)}}playRumble(e,t,i){let r=this.context,n=r.sampleRate*i,s=r.createBuffer(1,n,r.sampleRate),a=s.getChannelData(0),o=0;for(let e=0;e<n;e++){let t=2*Math.random()-1;a[e]=(o+.02*t)/1.02,o=a[e]}let l=r.createBufferSource();l.buffer=s;let u=r.createBiquadFilter();u.type="lowpass",u.frequency.value=100;let f=r.createGain();f.gain.value=.5*t,f.gain.exponentialRampToValueAtTime(.01,e+i),l.connect(u).connect(f).connect(r.destination),l.start(e)}playChime(e,t){let i=this.context;[523.25,659.25,783.99].forEach((r,n)=>{let s=i.createOscillator(),a=i.createGain();s.frequency.value=r,s.type="sine",a.gain.value=.3*t,a.gain.exponentialRampToValueAtTime(.01,e+.8),s.connect(a).connect(i.destination),s.start(e+.1*n),s.stop(e+1)})}playCrane(e,t){let i=this.context,r=i.createOscillator(),n=i.createGain(),s=i.createBiquadFilter();r.frequency.value=80+20*Math.random(),r.type="square",s.type="bandpass",s.frequency.value=200,n.gain.value=.4*t,n.gain.exponentialRampToValueAtTime(.01,e+.3),r.connect(s).connect(n).connect(i.destination),r.start(e),r.stop(e+.3)}playWhoosh(e,t,i){let r=this.context,n=r.createOscillator(),s=r.createGain(),a=r.createBiquadFilter();n.type="sawtooth",n.frequency.value=80,n.frequency.exponentialRampToValueAtTime(200,e+i),a.type="highpass",a.frequency.value=100,s.gain.value=.3*t,s.gain.exponentialRampToValueAtTime(.01,e+i),n.connect(a).connect(s).connect(r.destination),n.start(e),n.stop(e+i)}playSparkle(e,t){let i=this.context;[1,1.5,2,2.5].forEach((r,n)=>{let s=i.createOscillator(),a=i.createGain();s.frequency.value=2e3*r,s.type="sine",a.gain.value=.15*t,a.gain.exponentialRampToValueAtTime(.01,e+.3),s.connect(a).connect(i.destination),s.start(e+.02*n),s.stop(e+.4)})}playCrowd(e,t){let i=this.context,r=2*i.sampleRate,n=i.createBuffer(1,r,i.sampleRate),s=n.getChannelData(0);for(let e=0;e<r;e++)s[e]=2*Math.random()-1;let a=i.createBufferSource();a.buffer=n;let o=i.createBiquadFilter();o.type="bandpass",o.frequency.value=1e3,o.Q.value=2;let l=i.createGain();l.gain.value=.2*t,a.connect(o).connect(l).connect(i.destination),a.start(e)}playNature(e,t){let i=this.context;for(let r=0;r<3;r++){let n=i.createOscillator(),s=i.createGain();n.frequency.value=2e3+2e3*Math.random(),n.type="sine",s.gain.value=.2*t,s.gain.exponentialRampToValueAtTime(.01,e+.1+.15*r),n.connect(s).connect(i.destination),n.start(e+.15*r),n.stop(e+.2+.15*r)}}}let y=null;function x(){let e=(0,i.useRef)(null);return(0,i.useEffect)(()=>{y||(y=new g),e.current=y},[]),{playSound:(t,i)=>{e.current?.play(t,i)},enableSound:()=>e.current?.enable(),disableSound:()=>e.current?.disable()}}e.s(["useSoundEffects",()=>x],90730)}]);