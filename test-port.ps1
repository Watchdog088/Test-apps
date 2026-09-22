foreach ($port in @(22, 80, 443, 5000)) {
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect('100.48.76.239', $port)
        Write-Output "PORT $port OPEN"
        $tcp.Close()
    } catch {
        Write-Output "PORT $port CLOSED"
    }
}
