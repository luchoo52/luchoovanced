$port = 8080
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "NovaVance Server running on http://0.0.0.0:$port (Local IP: http://192.168.1.6:$port)"

$baseDir = $PSScriptRoot

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        
        $requestLine = $reader.ReadLine()
        if (-not $requestLine) {
            $client.Close()
            continue
        }

        # Read headers
        while ($line = $reader.ReadLine()) {
            if ($line -eq "") { break }
        }

        $parts = $requestLine.Split(" ")
        $rawUrl = if ($parts.Length -gt 1) { $parts[1].Split("?")[0] } else { "/" }
        if ($rawUrl -eq "/" -or $rawUrl -eq "") {
            $rawUrl = "/index.html"
        }

        $localPath = [System.IO.Path]::Combine($baseDir, $rawUrl.TrimStart("/").Replace("/", "\"))

        if ([System.IO.File]::Exists($localPath)) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".mp4"  { "video/mp4" }
                default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("HTTP/1.1 404 Not Found`r`nContent-Length: 14`r`nConnection: close`r`n`r`nFile Not Found")
            $stream.Write($notFound, 0, $notFound.Length)
        }

        $stream.Flush()
        $client.Close()
    }
} finally {
    $listener.Stop()
}
