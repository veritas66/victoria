import React, { useRef, useEffect, useState } from 'react';
import { hexagramDictionary } from './components/hexagramDictionary';

import * as THREE from 'three';
import HelloCanvas from './components/HelloCanvas';
import FloatingInput from './components/FloatingInput';
import ActionDiv from './components/ActionDiv';
import './app.css'

const defaultShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_fireColor;


float snoise(vec3 uv, float res)
{
    const vec3 s = vec3(1e0, 1e2, 1e3);
    
    uv *= res;
    
    vec3 uv0 = floor(mod(uv, res)) * s;
    vec3 uv1 = floor(mod(uv + vec3(1.), res)) * s;
    
    vec3 f = fract(uv);
    f = f * f * (3.0 - 2.0 * f);

    vec4 v = vec4(uv0.x + uv0.y + uv0.z, uv1.x + uv0.y + uv0.z,
                  uv0.x + uv1.y + uv0.z, uv1.x + uv1.y + uv0.z);

    vec4 r = fract(sin(v * 1e-1) * 1e3);
    float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
    
    r = fract(sin((v + uv1.z - uv0.z) * 1e-1) * 1e3);
    float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
    
    return mix(r0, r1, f.z) * 2.0 - 1.0;
}

void main() {
    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / u_resolution.xy;
    p.x *= u_resolution.x / u_resolution.y;
    
    float fire = 0.0;
    vec3 coord = vec3(atan(p.x, p.y) / 6.2832 + 0.5, length(p) * 0.9, 11);
    float oscillatingValue = sin(u_time * 0.4);
    float timeFactor = abs(oscillatingValue);
    timeFactor = mix(-5.9, 1.0, timeFactor);
    float shaderColor = 3.2 - (3.0 * length(2.0 * p)) + timeFactor;

    for (int i = 1; i <= 7; i++) {
        float power = pow(2.0, float(i));
        shaderColor += (1.5 / power) * snoise(coord + vec3(0.0, -u_time * 0.1, u_time * 0.01), power * 3.0);
    }
                
    // Use u_fireColor instead of hardcoded fireColor
    vec3 finalColor = mix(u_fireColor, u_fireColor * vec3(shaderColor), 0.3);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

function HexagramDetails({ details, pointerEvents, setPointerEvents, activeInput, setActiveInput, setShowDiv }) {
    const [currentLine, setCurrentLine] = useState(0);
    const [overlayOpacity, setOverlayOpacity] = useState(1);
    const [detailsOpacity, setDetailsOpacity] = useState(1);  // Step 1: New state variable
    const [showText, setShowText] = useState(false);  // Step 1: New state variable
    const [showStarButton, setShowStarButton] = useState(false);

    useEffect(() => {
        setOverlayOpacity(1);
        setDetailsOpacity(1);
        setShowText(false);
        setShowStarButton(false);
        setCurrentLine(0);
    }, []);


    useEffect(() => {
        if (currentLine === 8) {
            console.log("Button with star displayed!");
            setShowStarButton(true);
        }
    }, [currentLine]);

    const handleCastAnotherClick = (event) => {
        event.stopPropagation();
        setOverlayOpacity(0);
        setShowStarButton(false);
        setActiveInput(true);
        setPointerEvents("auto");
        setShowDiv(false);
    };

    const timeoutRef = useRef(null);
    const handleDivClick = () => {
        event.stopPropagation();
        setShowText(true);
        // Fade out the current line first
        setOverlayOpacity(0);
        setDetailsOpacity(0);
    
        // After the fade out transition completes, change the line and fade it back in
        setTimeout(() => {
            if (currentLine >= 8) {
                setCurrentLine(0);
            } else {
                setCurrentLine(prevLine => prevLine + 1);
                if (currentLine + 1 === 8) {
                }      
            }
            setOverlayOpacity(1);
        }, 1200);
    };

    return (
        <div onClick={handleDivClick} style={{         
            pointerEvents: pointerEvents,
            position: 'absolute', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            width: '100vw', 
            cursor: 'pointer'}}>
            
            {/* Blurred duplicate */}
            <div style={{ 
                position: 'absolute', 
                filter: 'blur(8px)', 
                color: 'rgba(255, 255, 255, 0.6)', 
                zIndex: 0, 
                opacity: detailsOpacity, 
                transition: 'opacity 2.5s'}}>
                <div style={{ 
                    height: '200px', 
                    width: '500px', 
                    fontSize: '160px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    fontFamily: 'ApercuPro-Regular' }}>
                    {details.nomc}
                </div>
                <div style={{ 
                    height: '50px', 
                    width: '500px', 
                    fontSize: '30px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    fontFamily: 'ApercuPro-Regular' }}>
                    {details.nome}
                </div>
            </div>

            {/* Original div */}
            <div style={{ 
                position: 'relative', 
                zIndex: 1, 
                opacity: detailsOpacity, 
                transition: 'opacity 2.5s' // 0.5s transition for opacity
}}>
                <div style={{ 
                    height: '200px', 
                    width: '500px', 
                    fontSize: '160px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    fontFamily: 'ApercuPro-Regular' }}>
                    {details.nomc}
                </div>
                <div style={{ 
                    height: '50px', 
                    width: '500px', 
                    fontSize: '30px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    fontFamily: 'ApercuPro-Regular' }}>
                    {details.nome}
                </div>
            </div>

            {/* Overlay div */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                backgroundColor: 'transparent',
                padding: '10px',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontFamily: 'ApercuPro-Regular',
                fontSize: '33px',
                textAlign: 'center',
                opacity: overlayOpacity,
                transition: 'opacity 2.5s' // 0.5s transition for opacity
            }} onClick={handleDivClick}>
                {
                showText && (
                    currentLine === 0 ? '' :
                    currentLine === 1 ? details.line1 :
                    currentLine === 2 ? details.line2 :
                    currentLine === 3 ? details.line3 :
                    currentLine === 4 ? details.line4 :
                    currentLine === 5 ? details.line5 :
                    currentLine === 6 ? details.line6 :
                    currentLine === 7 ? '' :
                    details.jud
                )
                }
            </div>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                backgroundColor: 'transparent',
                padding: '10px',
                borderRadius: '5px',
                filter: 'blur(8px)',
                color: 'white',
                cursor: 'pointer',
                fontFamily: 'ApercuPro-Regular',
                fontSize: '33px',
                textAlign: 'center',
                opacity: overlayOpacity,
                transition: 'opacity 2.5s'
            }}>
                {
                showText && (
                    currentLine === 0 ? '' :
                    currentLine === 1 ? details.line1 :
                    currentLine === 2 ? details.line2 :
                    currentLine === 3 ? details.line3 :
                    currentLine === 4 ? details.line4 :
                    currentLine === 5 ? details.line5 :
                    currentLine === 6 ? details.line6 :
                    currentLine === 7 ? '' :
                    details.jud
                )
                }
            </div>
            {
    showStarButton &&
        <div id="save-button" style={{
            position: 'absolute', 
            top: '80%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 10000,
            border: '1px solid white',
            cursor: 'pointer',
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px',
            fontFamily: 'ApercuPro-Regular',
            color: 'white'
        }}>
            Save to Journal
        </div>
        
        }
        {
    showStarButton &&
    <div 
        id="cast-another-button"
        onClick={(event) => handleCastAnotherClick(event)}
        style={{
            position: 'absolute', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 10000,
            border: '1px solid white',
            cursor: 'pointer',
            width: '50px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '12px',
            fontFamily: 'ApercuPro-Regular',
            color: 'white'
        }}
    >
        Cast Another
    </div>
}

        </div>
    );
}

export function App() {
    const [log, setLog] = useState(new Map())
    const [shipLog, setShipLog] = useState(new Map())
    const [oracle, setOracle] = useState({})
    const [intention, setIntention] = useState('')
    const [subEvent, setSubEvent] = useState({})
    const [status, setStatus] = useState(null)
    const [error, setError] = useState(null)

    const canvasRef = useRef(null);
    const materialRef = useRef(null);
    const [overlayOpacity, setOverlayOpacity] = useState(0);

    const [num, setNum] = useState(0.0);
    const [showHelloCanvas, setShowHelloCanvas] = useState(true);
    const [helloCanvasText, setHelloCanvasText] = useState('Your Text Here');
    const [currentShader, setCurrentShader] = useState("default");

    const [showDiv, setShowDiv] = useState(false);

    const [hexagramDetails, setHexagramDetails] = useState(null);
    const [currentFireColor, setCurrentFireColor] = useState({ r: 0.349, g: 0.416, b: 0.416 });
    const [activeInput, setActiveInput] = useState(true);
    const [pointerEvents, setPointerEvents] = useState("auto");
    
    const [detailsOpacity, setDetailsOpacity] = useState(1);

    useEffect(() => {
        console.log("activeInput state:", activeInput);
    }, [activeInput]);

    const handleIntentionSubmit = (intention) => {
        cast(intention);
    };

    // UI
    const toggleCanvas = () => {
        setShowHelloCanvas(!showHelloCanvas);
    };


    const actionDivRef = useRef(null);

    useEffect(() => {
        let isMouseOverDiv = false;

        const handleMouseMove = (e) => {
            if (window.innerHeight - e.clientY <= 50 && !isMouseOverDiv && actionDivRef.current) {
                actionDivRef.current.classList.add('show-action-div');
            }
        };

        const handleMouseOverDiv = () => {
            isMouseOverDiv = true;
        }

        const handleMouseLeaveDiv = () => {
            isMouseOverDiv = false;
            if (actionDivRef.current) {
                actionDivRef.current.classList.remove('show-action-div');
            }
        }

        window.addEventListener('mousemove', handleMouseMove);
        if (actionDivRef.current) {
            actionDivRef.current.addEventListener('mouseover', handleMouseOverDiv);
            actionDivRef.current.addEventListener('mouseout', handleMouseLeaveDiv);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (actionDivRef.current) {
                actionDivRef.current.removeEventListener('mouseover', handleMouseOverDiv);
                actionDivRef.current.removeEventListener('mouseout', handleMouseLeaveDiv);
            }
        };
    }, []);

    useEffect(() => {
        // Set up basic scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });

        const setRendererSize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            renderer.setSize(newWidth, newHeight);
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
        };
        setRendererSize();

        renderer.domElement.classList.add('renderer');
        document.body.appendChild(renderer.domElement);
        window.addEventListener('resize', setRendererSize);

        // Set up shader background
        const plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

        // Set up uniforms for material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_resolution: new THREE.Uniform(new THREE.Vector2()),
                u_time: { value: 0.0 },
                u_shaderColor: { value: 0.0 },
                u_fireColor: { value: new THREE.Vector3(0.349, 0.416, 0.416) },
                u_fadeFactor: { value: 0.0 }
            },
            fragmentShader: currentShader === "default" ? defaultShader : transparentShader
        });

        materialRef.current = material; // Reference current material for interactivity

        const bg = new THREE.Mesh(plane, material);
        scene.add(bg);

        // Add pointers
        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        const cursorTarget = new THREE.Vector3();

        // Add shadow
        const orb = new THREE.SphereGeometry(0.087, 32, 32);
        const orbMaterial = new THREE.MeshBasicMaterial({ color: 0xefefef });
        const shadow = new THREE.Mesh(orb, orbMaterial);
        scene.add(shadow);

        function onMouseMove(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children);

            if (intersects.length > 0) {
                const intersection = intersects[0];
                cursorTarget.copy(intersection.point); // Store the target position
                const dampingFactor = 0.1; // Adjust the damping factor as needed
                shadow.position.lerp(cursorTarget, dampingFactor);
            }
        }

        window.addEventListener('mousemove', onMouseMove, false);

        camera.position.z = 5;

        // Render and animate scene
        const render = () => {
            const object = scene.children[0];
            object.material.uniforms.u_resolution.value.x = window.innerWidth;
            object.material.uniforms.u_resolution.value.y = window.innerHeight;
            renderer.render(scene, camera);
        }

        const animate = () => {
            requestAnimationFrame(animate);
            material.uniforms.u_time.value += 0.01;
            render();
        };

        animate();
        
        return () => {
            window.removeEventListener('resize', setRendererSize);
            document.body.removeChild(renderer.domElement);
        };
    }, []);
    const flipCoin = () => {
        return Math.random() > 0.5 ? '1' : '0';
    }
      
    const constructBinary = () => {
    return Array.from({ length: 6 }, () => flipCoin()).join('');
    }
    
    // Gather hexagram details and show divs and overlays
    const getHexagramDetails = (binaryString) => {
        const details = hexagramDictionary[binaryString];
        if (details) {
            console.log(`nomc: ${details.nomc}, nome: ${details.nome}`);
            setHexagramDetails(details);
            setShowDiv(true);
        } else {
            console.log("No hexagram found for the given binary string.");
        }
    }

    const animationFrameRef = useRef(null);
    const timeoutRef = useRef(null);
    const fadeInStyle = {
        animationName: 'fadeIn',
        animationDuration: '2s',
        animationFillMode: 'forwards',
        opacity: 0,
        backgroundColor: 'black',
        transition: 'background-color 2s'
      };

    // Fade background shader to black
    const fadeToBlack = () => {
        if (materialRef.current) {
            materialRef.current.fragmentShader = defaultShader;
            materialRef.current.needsUpdate = true;
            
            // Clear any existing timeouts and animation frames
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
    
            // Initial flame color
            let fireColor = { ...currentFireColor };
    
            const binaryString = constructBinary();
            const hexagramDetails = hexagramDictionary[binaryString];
    
            // Extract target RGB values from hexagramDictionary
            let extractedColors = hexagramDetails.col.match(/vec3\(([^)]+)\)/)[1].split(',').map(Number);
            const targetColor = { r: extractedColors[0], g: extractedColors[1], b: extractedColors[2] };
    
            const decrement = 0.005;
            const frameDelay = 30;
    
            const animate = () => {
                animationFrameRef.current = requestAnimationFrame(animate);
    
                fireColor.r = THREE.MathUtils.lerp(fireColor.r, targetColor.r, decrement);
                fireColor.g = THREE.MathUtils.lerp(fireColor.g, targetColor.g, decrement);
                fireColor.b = THREE.MathUtils.lerp(fireColor.b, targetColor.b, decrement);
    
                materialRef.current.uniforms.u_fireColor.value = new THREE.Vector3(fireColor.r, fireColor.g, fireColor.b);
                materialRef.current.needsUpdate = true;
    
                if (Math.abs(fireColor.r - targetColor.r) > 0.01 || 
                    Math.abs(fireColor.g - targetColor.g) > 0.01 || 
                    Math.abs(fireColor.b - targetColor.b) > 0.01) {
                    timeoutRef.current = setTimeout(() => {
                        requestAnimationFrame(animate);
                    }, frameDelay);
                } else {
                    setHelloCanvasText(' ');
                }
            };
    
            animate();
            getHexagramDetails(binaryString);
            setDetailsOpacity(1);
            setShowDiv(true);
            handleIntentionSubmit();
        }
    };

    return (
            <div>
                <div className="app-container">
                    <ActionDiv />
                </div>
                <canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', backgroundColor: 'black', opacity: overlayOpacity }}></canvas>
                <canvas ref={canvasRef}></canvas>
                <main className='main'>
                    {showHelloCanvas && <HelloCanvas />} {/* Render HelloCanvas component */}
                    {activeInput && <FloatingInput onSubmit={fadeToBlack} />}
                </main>
                {showDiv && hexagramDetails && 
                    <div style={showDiv ? fadeInStyle : {}}>
                    <HexagramDetails 
                    details={hexagramDetails} 
                    pointerEvents={pointerEvents} 
                    setPointerEvents={setPointerEvents} 
                    setActiveInput={setActiveInput} 
                    setDetailsOpacity={setDetailsOpacity}
                    setShowDiv={setShowDiv}
                    />
                    </div>
                }
            </div>
    )
};