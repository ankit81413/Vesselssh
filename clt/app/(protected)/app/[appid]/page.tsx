
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
        <div>
            <iframe src={clt_url} className="h-150 w-full"></iframe>
        </div>
    )
}
