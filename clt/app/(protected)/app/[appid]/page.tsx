
export default async function AppPage({ params }: {
    params: Promise<{
        appid: string
    }>
}) {
    const { appid } = await params
    const res = await fetch(`${process.env.NEXT_PUBLIC_VESSEL_SERVER_URL}/api/openApp/${appid}`)
    const data = await res.json();
    console.log(data);
    const clt_url = data.data.clt_url
    


    return (
        <div className="h-dvh w-full overflow-hidden">
            <iframe src={clt_url} title={appid} className="block h-full w-full border-0"></iframe>
        </div>
    )
}
