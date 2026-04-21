import React, {useEffect, useRef, useState} from "react";
import SuitAPI from "../../services/SuitAPI";
import CartAPI from "../../services/CartAPI"
import AuthAPI from '../../services/AuthAPI'
import { apiFetch } from '../../services/api'
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
import { Suit } from "../../components/ui/Suit/Suit";
import { SINGLE, DOUBLE, TUXEDO } from "../../constants/SuitTypes"
import { useGLTF } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as ProductTypes from "../../constants/ProductTypes";
import MeasurementEstimator from "../../components/ui/MeasurementEstimator/MeasurementEstimator";
import SizeRecommendation from "../../components/ui/SizeRecommendation/SizeRecommendation";

// Preload all suit models
useGLTF.preload(`${SINGLE}.glb`);
useGLTF.preload(`${DOUBLE}.glb`);
useGLTF.preload(`${TUXEDO}.glb`);

function Visualize(){
    const [allFabrics, setAllFabrics] = useState([])
    const [fabricImage, setFabricImage] = useState(null)

    const [selectedFabric, setSelectedFabric] = useState(null)
    const [suitType, setSuitType] = useState(null)
    const [length, setLength] = useState(null)
    const [waist, setWaist] = useState(null)
    const [chest, setChest] = useState(null)
    const [armLength, setArmLength] = useState(null)
    const [suitScreenshot, setSuitScreenshot] = useState(null)

	const navigate = useNavigate()
    const [disableSubmit, setDisableSubmit] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [fabricsLoading, setFabricsLoading] = useState(true)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [price, setPrice] = useState(0)

    const ref = useRef()

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Fetching all fabrics
    useEffect(() => {
        async function getFab(){
            try {
                const res = await apiFetch('/api/v1/fabric')
                const data = await res.json()
                const fabricData = data.fabrics || []
                setAllFabrics(fabricData)
            } catch(err) {
                console.error('Failed to load fabrics:', err)
            } finally {
                setFabricsLoading(false)
            }
        }

        async function check(){
            var res = await AuthAPI.isLoggedIn()
            setIsLoggedIn(res)
        }

        getFab()
        check()
    }, [])

    // Enabling Add to cart Button
    useEffect(() => {
        console.log(selectedFabric, suitType, length, waist, chest, armLength)

        if(!suitType || !selectedFabric || !length || !waist || !chest || !armLength){
            setDisableSubmit(true)
        } else {
            setDisableSubmit(false)
        }

    }, [selectedFabric, suitType, length, waist, chest, armLength])

    useEffect(() => {
        if (selectedFabric && suitType) getPrice()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFabric, suitType])

    // Taking screenshot when fabric/suitType selected
    useEffect(() => {
        async function takeScreeenshot(){
            await sleep(500)        // Needs to wait until the fabric/suitType changes in canvas
            if (!ref.current) return
            ref.current.toBlob((blob) => {
                var file = new File([blob], 'image', {type: "image/jpeg"})
                setSuitScreenshot(file)
                console.log(URL.createObjectURL(blob))
            })
        }

        takeScreeenshot()

    }, [selectedFabric, suitType])

    async function addToCart(){
        setIsLoading(true)
        try {
            var suit = await SuitAPI.createSuit(selectedFabric, suitType, length, waist, chest, armLength, suitScreenshot)
            if (!suit || !suit._id) throw new Error('Failed to create suit')
            var cart = await CartAPI.addToCart(ProductTypes.SUIT, suit._id)
            if (!cart) throw new Error('Failed to add to cart')
            navigate('/add-to-cart')
        } catch(err) {
            console.error(err)
            alert('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const getPrice = async () => {
        let suitInfo = {suit_type: suitType, fabric_id: selectedFabric?._id, fabric_type: selectedFabric?.name}
        try {
            let res = await apiFetch('/api/v1/suit/price/get', {
                method: 'POST',
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(suitInfo)
            })
            let data = await res.json()
            setPrice(data.price)
        } catch(err) {
            console.error('Price fetch failed:', err)
        }
    }


    return (
        <div className="mt-3 row justify-content-center align-items-start">

            {/* Material Selection */}
            <div className="col-3 overflow-y-auto" style={{height: 680}}>
            <h2>Select materials</h2>
                <div className="d-flex flex-column gap-2 mt-3">
                    {fabricsLoading ? (
                        <div className="d-flex justify-content-center mt-4">
                            <div className="spinner-border" style={{color:'#c9a84c', width:40, height:40}} role="status" />
                        </div>
                    ) : allFabrics.length === 0 ? (
                        <p style={{color:'#a09880', fontSize:13}}>No fabrics available.</p>
                    ) : (
                        allFabrics.map((fab, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setFabricImage(fab.image); setSelectedFabric(fab); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    background: selectedFabric?._id === fab._id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                                    border: selectedFabric?._id === fab._id ? '1px solid #c9a84c' : '1px solid rgba(201,168,76,0.15)',
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left',
                                    width: '100%'
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                                    background: fab.color?.toLowerCase() === 'navy blue' ? '#1a237e'
                                        : fab.color?.toLowerCase() === 'beige' ? '#d4b896'
                                        : fab.color?.toLowerCase() === 'black' ? '#1a1a1a'
                                        : fab.color?.toLowerCase() || '#888',
                                    border: '2px solid rgba(255,255,255,0.1)'
                                }} />
                                <div>
                                    <div style={{color:'#f0ead6', fontWeight:600, fontSize:14}}>{fab.name}</div>
                                    <div style={{color:'#a09880', fontSize:12}}>{fab.color} · £{fab.price}/m</div>
                                </div>
                                {selectedFabric?._id === fab._id && (
                                    <span style={{marginLeft:'auto', color:'#c9a84c', fontSize:16}}>✓</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Showing 3D model */}
            <div className="col-4">
                <Canvas ref={ref} gl={{ preserveDrawingBuffer: true }} camera={{ position: [5, 5, 5], fov: 35 }} castShadow style={{height: 500}}>
                    <ambientLight intensity={Math.PI / 2} />
                    <directionalLight castShadow position={[0, 15, 40]} intensity={Math.PI * 2}/>
                    <directionalLight castShadow position={[0, 0, -40]} intensity={Math.PI * 2}/>
                    
                    {/* Only render 3D suit when type is selected */}
                    {suitType && (
                        <Suit key={`${suitType}-${selectedFabric?._id}`} colorMap_src={fabricImage ? fabricImage : 'default_fabric.jpg'} suitType={suitType} fabricColor={selectedFabric?.color} />
                    )}
                    
                    <OrbitControls autoRotate autoRotateSpeed={1} enablePan={false} minPolarAngle={Math.PI / 2.1} maxPolarAngle={Math.PI / 2.1} /> 
                    
                </Canvas>
            </div>

            {/* Suit Type & Measurements */}
            <div className="col-3 ">

                <h2>Select Type</h2>
                <div className="d-flex flex-wrap gap-3 mb-4">
                    {[
                        { type: SINGLE, label: 'Single Breast', icon: '/suit101.png', desc: 'Classic single-breasted style' },
                        { type: DOUBLE, label: 'Double Breast', icon: '/doublebreast.png', desc: 'Bold double-breasted look' },
                        { type: TUXEDO, label: 'Tuxedo', icon: '/tuxedo.png', desc: 'Formal evening wear' },
                    ].map(s => (
                        <button
                            key={s.type}
                            onClick={() => setSuitType(s.type)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 16px',
                                background: suitType === s.type ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                                border: suitType === s.type ? '2px solid #c9a84c' : '1px solid rgba(201,168,76,0.15)',
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                width: 100,
                                position: 'relative'
                            }}
                        >
                            <img
                                src={s.icon}
                                alt={s.label}
                                style={{ width: 60, height: 70, objectFit: 'contain' }}
                                onError={e => { e.target.style.display='none' }}
                            />
                            <span style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: suitType === s.type ? '#c9a84c' : '#a09880',
                                textAlign: 'center',
                                lineHeight: 1.3
                            }}>{s.label}</span>
                            {suitType === s.type && (
                                <span style={{
                                    position: 'absolute', top: 6, right: 6,
                                    background: '#c9a84c', color: '#0d0d0d',
                                    borderRadius: '50%', width: 18, height: 18,
                                    fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>✓</span>
                            )}
                        </button>
                    ))}
                </div>

                <h2>Measurements</h2>
                <SizeRecommendation onApply={(m) => {
                    setChest(m.chest); setWaist(m.waist); setLength(m.length); setArmLength(m.armLength);
                }} />
                <MeasurementEstimator onMeasurementsDetected={(m) => {
                    setChest(m.chest)
                    setWaist(m.waist)
                    setLength(m.length)
                    setArmLength(m.armLength)
                }} />
                <div className="row row-cols-2 g-3 mb-5">
                    <div className="form-floating">
                        <input type="number" className="form-control" value={length || ''} onChange={(e) => {setLength(e.target.value)}} id="length" style={{resize: "none"}}/>
                        <label className="ms-2 text-secondary" htmlFor="length">Length</label>
                    </div>
                    <div className="form-floating">
                        <input type="number" className="form-control" value={waist || ''} onChange={(e) => {setWaist(e.target.value)}} id="waist" style={{resize: "none"}}/>
                        <label className="ms-2 text-secondary" htmlFor="waist">Waist</label>
                    </div>
                    <div className="form-floating">
                        <input type="number" className="form-control" value={chest || ''} onChange={(e) => {setChest(e.target.value)}} id="chest" style={{resize: "none"}}/>
                        <label className="ms-2 text-secondary" htmlFor="chest">Chest</label>
                    </div>
                    <div className="form-floating">
                        <input type="number" className="form-control" value={armLength || ''} onChange={(e) => {setArmLength(e.target.value)}} id="arm-length" style={{resize: "none"}}/>
                        <label className="ms-2 text-secondary" htmlFor="arm-ength">Arm Length</label>
                    </div>
                </div>
                
                {/* Price */}
                <div className="row mb-4">
                    <div style={{
                        background: 'rgba(201,168,76,0.08)',
                        border: '1px solid rgba(201,168,76,0.2)',
                        borderRadius: 12,
                        padding: '16px 20px'
                    }}>
                        <div style={{fontSize:12, color:'#a09880', textTransform:'uppercase', letterSpacing:1, marginBottom:8}}>Estimated Price</div>
                        <div style={{fontSize:'2rem', fontWeight:700, color:'#c9a84c', fontFamily:'Playfair Display, serif'}}>
                            {price && selectedFabric && suitType ? `£${price}` : (
                                <div style={{fontSize:13, color:'#6b6355'}}>
                                    {!selectedFabric && !suitType ? '← Select fabric & suit type' :
                                     !selectedFabric ? '← Select a fabric' :
                                     !suitType ? 'Select a suit type ↑' : 'Calculating...'}
                                </div>
                            )}
                        </div>
                        {price > 0 && selectedFabric && (
                            <div style={{marginTop:8, fontSize:12, color:'#6b6355'}}>
                                {suitType?.replace('_', ' ')} · {selectedFabric?.name} · {selectedFabric?.color}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add to cart */}
                <div className="row p-2">
                    {!isLoggedIn ? 
                        <button type="button" onClick={() => navigate('/login')} className="btn btn-warning">
                            🔒 Login to Add to Cart
                        </button>
                        : disableSubmit ?
                        <button type="button" className="btn btn-secondary" disabled>
                            Fill all measurements to continue
                        </button>
                        :
                        <button type="button" onClick={addToCart} className="btn btn-success" disabled={isLoading}>
                            {isLoading 
                                ? <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                : '🛒 Add to Cart'
                            }
                        </button>
                    }
                </div>
            </div>

        </div>
    )
}

export default Visualize;