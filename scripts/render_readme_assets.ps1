$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$screenshots = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

Add-Type -AssemblyName System.Drawing

function New-ProofImage {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle,
        [string[]]$Bullets
    )

    $bitmap = New-Object System.Drawing.Bitmap 1600, 1000
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::FromArgb(7, 10, 15))

    $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 18, 32))
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 255, 139))
    $altAccentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 199, 255))
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(233, 243, 255))
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(171, 186, 201))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(42, 111, 88), 2)

    $graphics.FillRectangle($panelBrush, 48, 48, 1504, 904)
    $graphics.DrawRectangle($borderPen, 48, 48, 1504, 904)

    $eyebrowFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleFont = New-Object System.Drawing.Font("Georgia", 34, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 18)
    $bulletFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)

    $graphics.DrawString("GCP Billing Anomaly Router", $eyebrowFont, $accentBrush, 92, 92)
    $graphics.DrawString($Title, $titleFont, $textBrush, 92, 142)
    $graphics.DrawString($Subtitle, $bodyFont, $mutedBrush, 92, 214)

    $y = 320
    foreach ($bullet in $Bullets) {
        $graphics.DrawString("•", $bulletFont, $altAccentBrush, 108, $y)
        $graphics.DrawString($bullet, $bodyFont, $textBrush, 138, $y + 2)
        $y += 82
    }

    $graphics.DrawString("Synthetic proof render for README packaging.", $bodyFont, $mutedBrush, 92, 880)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-ProofImage -Path (Join-Path $screenshots "01-overview-proof.png") `
    -Title "Overview proof" `
    -Subtitle "Budget breaches, service spikes, allocation drift, and export gaps in one GCP FinOps operator surface." `
    -Bullets @(
        "Budget posture and cost anomalies surface before monthly surprises turn into executive escalations.",
        "Unlabeled spend and commitment waste stay visible instead of buried in billing exports.",
        "Routing packets make finance, platform, and governance ownership explicit."
    )

New-ProofImage -Path (Join-Path $screenshots "02-billing-lane-proof.png") `
    -Title "Billing lane" `
    -Subtitle "Every lane keeps owner, anomaly family, drift focus, status, and next action visible." `
    -Bullets @(
        "Budget, service spike, allocation, and export lanes stay separated cleanly.",
        "Commitment and egress posture remain easy to scan.",
        "Escalation paths are ready for operator review."
    )

New-ProofImage -Path (Join-Path $screenshots "03-anomaly-risks-proof.png") `
    -Title "Anomaly risks" `
    -Subtitle "Findings map severity, scope, owner, anomaly family, and the exact billing rule that fired." `
    -Bullets @(
        "High-severity breaches and export gaps surface first.",
        "Owner mapping keeps FinOps and cloud-governance accountability explicit.",
        "The lane is grounded in GCP billing anomaly evidence."
    )

New-ProofImage -Path (Join-Path $screenshots "04-routing-posture-proof.png") `
    -Title "Routing posture" `
    -Subtitle "Packets tie completeness, blocker, owner, and escalation timing together." `
    -Bullets @(
        "Budget containment, label backfill, and export restoration stay readable.",
        "Red/yellow/green review posture is easy to scan.",
        "The system is shaped for real GCP billing and FinOps proof."
    )
