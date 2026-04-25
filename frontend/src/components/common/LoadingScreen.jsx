export default function LoadingScreen() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:'20px'}}>⚡</div>
        <div className="spinner" style={{margin:'0 auto'}}></div>
      </div>
    </div>
  )
}
