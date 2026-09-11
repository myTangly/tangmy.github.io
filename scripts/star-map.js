import * as THREE from '../assets/vendor/three/three.module.min.js';
export function createStarMap({canvas, zone, labels, count, onFailure}) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference:'low-power'});
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.z = 12;
  const rig = new THREE.Group(), orbit = new THREE.Group();
  scene.add(rig); rig.add(orbit);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7290b5, 3));
  const light = new THREE.DirectionalLight(0xffffff, 4); light.position.set(-3,5,6); scene.add(light);
  const core = new THREE.Mesh(new THREE.SphereGeometry(.56, 40, 28), new THREE.MeshStandardMaterial({color:0x99bbee,metalness:.65,roughness:.25}));
  core.material.color.set(0xffffff);
  core.material.metalness=0;
  core.material.roughness=.85;
  // Preserve the real coastlines while grading satellite colors into cool blue.
  core.material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float brightness=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
      float landSignal=smoothstep(.005,.065,diffuseColor.g-diffuseColor.b*.65);
      float elevationTone=clamp(brightness*2.,0.,1.);
      vec3 digitalOcean=mix(vec3(.025,.09,.25),vec3(.055,.22,.48),elevationTone);
      vec3 digitalLand=mix(vec3(.16,.39,.64),vec3(.64,.84,.98),sqrt(elevationTone));
      diffuseColor.rgb=mix(digitalOcean,digitalLand,landSignal);
    `);
  };
  core.material.customProgramCacheKey=()=> 'tangmy-digital-earth-v1';
  const earthTexture=new THREE.TextureLoader().load('/assets/earth-blue-marble.png', texture=>{
    if(disposed){texture.dispose();return;}
    texture.colorSpace=THREE.SRGBColorSpace;
    core.material.map=texture;core.material.needsUpdate=true;
  }, undefined, ()=>{if(!disposed)onFailure();});
  rig.add(core);
  // Surface engravings share the core's slow rotation, without extra textures.
  const engravingMaterial=new THREE.LineBasicMaterial({color:0xd7eaff,transparent:true,opacity:.09});
  const surfaceLine=(points,mat=engravingMaterial)=>{
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),mat);
    core.add(line);
  };
  for(const latitude of [-.65,-.32,0,.32,.65]){
    const y=Math.sin(latitude)*.563,r=Math.cos(latitude)*.563;
    surfaceLine(Array.from({length:97},(_,j)=>{const a=j/96*Math.PI*2;return new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);}));
  }
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    surfaceLine(Array.from({length:65},(_,j)=>{const t=j/64*Math.PI;return new THREE.Vector3(Math.sin(t)*Math.cos(a)*.563,Math.cos(t)*.563,Math.sin(t)*Math.sin(a)*.563);}));
  }
  const equatorMaterial=new THREE.LineBasicMaterial({color:0xe9f5ff,transparent:true,opacity:.2});
  for(let i=0;i<32;i++){
    const a=i/32*Math.PI*2;
    surfaceLine([new THREE.Vector3(Math.cos(a)*.565,-.012,Math.sin(a)*.565),new THREE.Vector3(Math.cos(a)*.565,i%4===0?.045:.017,Math.sin(a)*.565)],equatorMaterial);
  }
  const shellMaterial = new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{},vertexShader:`varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 n;varying vec3 v;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),2.4);gl_FragColor=vec4(.32,.62,1.,rim*.5);}`});
  rig.add(new THREE.Mesh(new THREE.SphereGeometry(.78,32,24),shellMaterial));
  const instruments=[];
  for(let i=0;i<2;i++){
    const group=new THREE.Group();
    const band=new THREE.Mesh(new THREE.TorusGeometry(.94+i*.2,.018,6,96,Math.PI*1.65),new THREE.MeshBasicMaterial({color:i?0x89b7ef:0x356ae6,transparent:true,opacity:.72}));
    group.add(band);group.rotation.set(.5+i*.7,.3,i*.8);rig.add(group);instruments.push(group);
    for(let j=0;j<24;j++){
      const tick=new THREE.Mesh(new THREE.BoxGeometry(.012,j%3===0?.09:.035,.012),new THREE.MeshBasicMaterial({color:0x83a9df,transparent:true,opacity:.55}));
      const a=j/24*Math.PI*2;tick.position.set(Math.cos(a)*(1.04+i*.2),Math.sin(a)*(1.04+i*.2),0);tick.rotation.z=a-Math.PI/2;group.add(tick);
    }
  }
  const ringMaterial = new THREE.LineBasicMaterial({color:0x729bdb,transparent:true,opacity:.5});
  function ring(radius, x, z, opacity) {
    const points = Array.from({length:129}, (_,i) => new THREE.Vector3(Math.cos(i/128*Math.PI*2)*radius,0,Math.sin(i/128*Math.PI*2)*radius));
    const material = ringMaterial.clone(); material.opacity = opacity;
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    line.rotation.x=x; line.rotation.z=z; rig.add(line);
  }
  ring(2.1,.32,-.18,.6); ring(1.56,1.12,.52,.3); ring(1.15,.68,-.85,.5); ring(.79,1.1,-.5,.6);
  const nodes = [], connections=[];
  for(let i=0;i<count;i++){
    const angle=i/count*Math.PI*2;
    const position=new THREE.Vector3(Math.sin(angle)*2.1,Math.sin(angle)*.18,Math.cos(angle)*2.1);
    const node=new THREE.Group();
    const ink=new THREE.MeshStandardMaterial({color:0x356ae6,metalness:.3,roughness:.32});
    const porcelain=new THREE.MeshStandardMaterial({color:0xeaf3ff,metalness:.15,roughness:.28});
    const addBox=(w,h,d,x,y,z,mat=ink)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);node.add(mesh);return mesh;};
    if(i===0){
      for(const x of [-1,1])for(const y of [-1,1])addBox(.16,.16,.16,x*.1,y*.1,0,x===y?ink:porcelain);
    }else if(i===1){
      addBox(.42,.28,.09,0,0,0,porcelain);
      addBox(.3,.16,.1,0,0,.015);
      for(const x of [-.15,-.05,.05,.15])for(const y of [-.115,.115])addBox(.035,.03,.012,x,y,.054);
    }else{
      addBox(.42,.3,.08,0,0,0,porcelain);addBox(.34,.22,.02,0,0,.05);
      const a=addBox(.1,.018,.015,-.075,.032,.067,porcelain);a.rotation.z=-.6;
      const b=addBox(.1,.018,.015,-.075,-.023,.067,porcelain);b.rotation.z=.6;
      addBox(.085,.018,.015,.065,-.045,.067,porcelain);
    }
    node.position.copy(position); orbit.add(node); nodes.push(node);
    const connection=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), position]),new THREE.LineBasicMaterial({color:0x91b3e5,transparent:true,opacity:.28}));
    orbit.add(connection);
    connections.push(connection);
    const halo=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),shellMaterial.clone());
    node.add(halo);
  }
  orbit.rotation.x=.35;
  const compact = () => matchMedia('(pointer:coarse)').matches || innerWidth < 768;
  const positions=new Float32Array(640*3);
  for(let i=0;i<640;i++){
    const angle=i*2.399963, radius=1.85+Math.sin(i*13.7)*.34+Math.sin(i*3.1)*.12;
    positions[i*3]=Math.cos(angle)*radius;
    positions[i*3+1]=Math.sin(i*7.3)*.13;
    positions[i*3+2]=Math.sin(angle)*radius;
  }
  const geometry=new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uDpr:{value:1}},vertexShader:`
uniform float uTime; uniform float uDpr; varying float alpha;
void main(){vec3 p=position;float a=uTime*.025+length(p.xz)*.12;mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a));p.xz=r*p.xz;p.y+=sin(p.x*1.3+uTime*.15)*.12;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uDpr*(1.7+sin(position.x*4.)*.6);alpha=.25+.35*(.5+.5*sin(position.z*2.));}`,
fragmentShader:`varying float alpha;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.12,d);gl_FragColor=vec4(.22,.43,.79,a*alpha);}`});
  const particles=new THREE.Points(geometry,material); particles.rotation.x=.45; rig.add(particles);
  // One very low-contrast shader surface gives the background a slow liquid light.
  const flowMaterial=new THREE.ShaderMaterial({depthWrite:false,transparent:true,uniforms:{uTime:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
varying vec2 vUv;uniform float uTime;
void main(){vec2 p=vUv-.5;float w=sin(p.x*7.+sin(p.y*6.+uTime*.07)*.6+uTime*.035);float fade=exp(-dot(p,p)*8.);float a=(.5+.5*w)*fade*.105;gl_FragColor=vec4(.48,.65,.95,a);}`});
  const flow=new THREE.Mesh(new THREE.PlaneGeometry(20,16),flowMaterial);flow.position.z=-4;scene.add(flow);
  let selected=0,target=0,current=0,frame=0,last=0,time=0,visible=true,disposed=false;
  let slowSeconds=0, lowQuality=false;
  const dragOrientation=new THREE.Quaternion();
  const dragStep=new THREE.Quaternion();
  let resetOrientation=false;
  let rect,units,scale=1,mouseX=0,mouseY=0;
  function resize(){
    const low=compact()||lowQuality; renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.5));
    renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    units=2*Math.tan(THREE.MathUtils.degToRad(35)/2)*12/innerHeight;
    rect=zone.getBoundingClientRect();scale=Math.min(rect.width/5.5,rect.height/4.9)*units;
    rig.scale.setScalar(scale);geometry.setDrawRange(0,low?160:640);material.uniforms.uDpr.value=renderer.getPixelRatio();
  }
  function updatePosition(){
    rect=zone.getBoundingClientRect();
    rig.position.set((rect.left+rect.width*.5-innerWidth*.5)*units,-(rect.top+rect.height*.43-innerHeight*.5)*units,0);
  }
  function render(now){
    if(disposed||!visible||document.hidden) {frame=0;return;}
    const rawDt=last?(now-last)/1000:0;
    const dt=Math.min(rawDt,.05);last=now;time+=dt;
    slowSeconds=rawDt>.055?slowSeconds+dt:Math.max(0,slowSeconds-dt);
    if(slowSeconds>2&&!lowQuality){lowQuality=true;geometry.setDrawRange(0,160);renderer.setPixelRatio(1);}
    if(slowSeconds>6){onFailure();return;}
    current+=(target-current)*(1-Math.exp(-dt*3));
    orbit.rotation.y=current;
    if(resetOrientation){dragOrientation.slerp(new THREE.Quaternion(),1-Math.exp(-dt*3));}
    rig.quaternion.copy(dragOrientation);
    rig.rotateZ(-.16+Math.sin(time*.09)*.025);
    material.uniforms.uTime.value=time;flowMaterial.uniforms.uTime.value=time;core.rotation.y=current+time*.035;
    instruments[0].rotation.y=.3+time*.045;instruments[1].rotation.x=1.2-time*.035;
    updatePosition();scene.updateMatrixWorld();
    nodes.forEach((node,i)=>{
      const point=node.getWorldPosition(new THREE.Vector3()).project(camera);
      const halfWidth=labels[i].offsetWidth/2+4;
      const x=(point.x+1)*innerWidth/2-rect.left;
      labels[i].style.left=`${Math.max(halfWidth,Math.min(rect.width-halfWidth,x))}px`;
      labels[i].style.top=`${Math.min(rect.height-66,(1-point.y)*innerHeight/2-rect.top+42)}px`;
      const size=i===selected?1.32:1;
      node.scale.lerp(new THREE.Vector3(size,size,size),1-Math.exp(-dt*4));
      node.rotation.y=0;
      connections[i].material.opacity+=( (i===selected?.7:.16)-connections[i].material.opacity)*(1-Math.exp(-dt*4));
    });
    renderer.render(scene,camera);frame=requestAnimationFrame(render);
  }
  function start(){if(!disposed&&!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(render);}}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visible?start():stop();});observer.observe(zone);
  const visibility=()=>document.hidden?stop():start();
  const pointer=event=>{if(!compact()){mouseX=Math.max(-1,Math.min(1,(event.clientX/innerWidth-.5)*2));mouseY=Math.max(-1,Math.min(1,(event.clientY/innerHeight-.5)*2));}};
  const lost=event=>{event.preventDefault();onFailure();};
  addEventListener('resize',resize);addEventListener('pointermove',pointer,{passive:true});document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',lost);
  resize();start();
  return {
    select(index,preserveView=false){selected=index;if(preserveView)return;resetOrientation=true;const desired=-index/count*Math.PI*2;target=current+Math.atan2(Math.sin(desired-current),Math.cos(desired-current));},
    drag(dx,dy){resetOrientation=false;target=current;const distance=Math.hypot(dx,dy);if(!distance)return;dragStep.setFromAxisAngle(new THREE.Vector3(dy,dx,0).normalize(),distance*.008);dragOrientation.premultiply(dragStep).normalize();},
    frontProject(){scene.updateMatrixWorld(true);let front=0,depth=-Infinity;nodes.forEach((node,i)=>{const z=node.getWorldPosition(new THREE.Vector3()).z;if(z>depth){depth=z;front=i;}});return front;},
    dispose(){if(disposed)return;disposed=true;stop();observer.disconnect();removeEventListener('resize',resize);removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);scene.traverse(object=>{object.geometry?.dispose();if(object.material)object.material.dispose();});earthTexture.dispose();renderer.dispose();}
  };
}
