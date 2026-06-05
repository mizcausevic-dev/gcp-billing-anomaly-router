$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$screenshots = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

Add-Type -AssemblyName System.Drawing

function New-Brush([int]$r, [int]$g, [int]$b, [int]$a = 255) {
    return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($a, $r, $g, $b))
}

function New-Pen([int]$r, [int]$g, [int]$b, [int]$a = 255, [single]$width = 1) {
    return New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($a, $r, $g, $b), $width)
}

function New-Font([string]$name, [single]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
    return New-Object System.Drawing.Font($name, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function RectF([single]$x, [single]$y, [single]$w, [single]$h) {
    return New-Object System.Drawing.RectangleF($x, $y, $w, $h)
}

function Draw-Text {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush,
        [single]$X,
        [single]$Y,
        [single]$W,
        [single]$H,
        [string]$Align = "Near"
    )

    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::$Align
    $format.LineAlignment = [System.Drawing.StringAlignment]::Near
    $format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
    $Graphics.DrawString($Text, $Font, $Brush, (RectF $X $Y $W $H), $format)
    $format.Dispose()
}

function Draw-Panel {
    param(
        [System.Drawing.Graphics]$Graphics,
        [single]$X,
        [single]$Y,
        [single]$W,
        [single]$H,
        [System.Drawing.Brush]$Brush,
        [System.Drawing.Pen]$Pen
    )

    $Graphics.FillRectangle($Brush, $X, $Y, $W, $H)
    $Graphics.DrawRectangle($Pen, $X, $Y, $W, $H)
}

function Draw-Chip {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [single]$X,
        [single]$Y,
        [single]$W,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush,
        [System.Drawing.Brush]$Background,
        [System.Drawing.Pen]$Pen
    )

    $Graphics.FillRectangle($Background, $X, $Y, $W, 34)
    $Graphics.DrawRectangle($Pen, $X, $Y, $W, 34)
    Draw-Text $Graphics $Text $Font $Brush ($X + 14) ($Y + 9) ($W - 28) 24
}

function Draw-Metric {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Value,
        [string]$Label,
        [string]$Detail,
        [single]$X,
        [single]$Y,
        [single]$W,
        [System.Drawing.Font]$ValueFont,
        [System.Drawing.Font]$LabelFont,
        [System.Drawing.Font]$BodyFont,
        [System.Drawing.Brush]$AccentBrush,
        [System.Drawing.Brush]$TextBrush,
        [System.Drawing.Brush]$MutedBrush,
        [System.Drawing.Brush]$PanelBrush,
        [System.Drawing.Pen]$BorderPen
    )

    Draw-Panel $Graphics $X $Y $W 170 $PanelBrush $BorderPen
    Draw-Text $Graphics $Value $ValueFont $AccentBrush ($X + 22) ($Y + 18) ($W - 44) 44
    Draw-Text $Graphics $Label $LabelFont $TextBrush ($X + 22) ($Y + 68) ($W - 44) 22
    Draw-Text $Graphics $Detail $BodyFont $MutedBrush ($X + 22) ($Y + 96) ($W - 44) 58
}

function Draw-Bullet {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [single]$X,
        [single]$Y,
        [single]$W,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$TextBrush,
        [System.Drawing.Brush]$DotBrush
    )

    $Graphics.FillEllipse($DotBrush, $X, ($Y + 8), 10, 10)
    Draw-Text $Graphics $Text $Font $TextBrush ($X + 24) $Y ($W - 24) 48
}

function New-ProofBoard {
    param(
        [string]$Path,
        [string]$Kicker,
        [string]$Title,
        [string]$Subtitle,
        [object[]]$Metrics,
        [object[]]$Cards,
        [object[]]$TableRows
    )

    $bitmap = New-Object System.Drawing.Bitmap 1800, 1080
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $bg = New-Brush 6 9 15
    $panel = New-Brush 12 20 34
    $panel2 = New-Brush 15 24 40
    $chipBg = New-Brush 22 32 51
    $text = New-Brush 238 246 255
    $muted = New-Brush 171 186 201
    $faint = New-Brush 104 124 143
    $green = New-Brush 55 255 139
    $cyan = New-Brush 25 199 255
    $amber = New-Brush 255 204 102
    $red = New-Brush 255 92 122
    $plum = New-Brush 184 140 255
    $border = New-Pen 54 255 170 90 2
    $softBorder = New-Pen 104 124 143 70 1
    $gridPen = New-Pen 54 255 170 18 1

    $mono = New-Font "Consolas" 19 ([System.Drawing.FontStyle]::Regular)
    $monoSmall = New-Font "Consolas" 15 ([System.Drawing.FontStyle]::Regular)
    $eyebrow = New-Font "Consolas" 17 ([System.Drawing.FontStyle]::Bold)
    $titleFont = New-Font "Segoe UI" 64 ([System.Drawing.FontStyle]::Bold)
    $sectionFont = New-Font "Segoe UI" 30 ([System.Drawing.FontStyle]::Bold)
    $cardTitle = New-Font "Segoe UI" 24 ([System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Font "Segoe UI" 22 ([System.Drawing.FontStyle]::Regular)
    $smallFont = New-Font "Segoe UI" 18 ([System.Drawing.FontStyle]::Regular)
    $metricValue = New-Font "Consolas" 44 ([System.Drawing.FontStyle]::Bold)
    $metricLabel = New-Font "Consolas" 16 ([System.Drawing.FontStyle]::Bold)

    try {
        $graphics.Clear($bg.Color)

        for ($x = 0; $x -lt 1800; $x += 60) {
            $graphics.DrawLine($gridPen, $x, 0, $x, 1080)
        }
        for ($y = 0; $y -lt 1080; $y += 60) {
            $graphics.DrawLine($gridPen, 0, $y, 1800, $y)
        }

        Draw-Panel $graphics 46 44 1708 986 $panel $border
        $graphics.FillRectangle((New-Brush 25 199 255 220), 46, 44, 1708, 5)
        $graphics.FillRectangle((New-Brush 55 255 139 220), 46, 44, 470, 5)

        Draw-Chip $graphics $Kicker 88 82 420 $monoSmall $green $chipBg $softBorder
        Draw-Text $graphics $Title $titleFont $text 88 142 940 230
        Draw-Text $graphics $Subtitle $bodyFont $muted 92 370 880 86

        Draw-Panel $graphics 1070 92 610 318 $panel2 $softBorder
        Draw-Text $graphics "BOARD-READY COST POSTURE" $eyebrow $green 1102 124 560 28
        Draw-Bullet $graphics "Budget breaches and service spikes surface before forecast trust breaks." 1102 176 540 $smallFont $text $cyan
        Draw-Bullet $graphics "Unlabeled spend, export gaps, and idle commitments stay attached to owners." 1102 238 540 $smallFont $text $cyan
        Draw-Bullet $graphics "Routing packets make the next remediation step explicit." 1102 300 540 $smallFont $text $cyan

        $metricY = 478
        $metricW = 230
        for ($i = 0; $i -lt $Metrics.Count; $i++) {
            $mx = 88 + ($i * ($metricW + 20))
            $accent = @($cyan, $green, $plum, $red, $amber)[$i % 5]
            Draw-Metric $graphics $Metrics[$i].Value $Metrics[$i].Label $Metrics[$i].Detail $mx $metricY $metricW $metricValue $metricLabel $smallFont $accent $text $muted $panel2 $softBorder
        }

        Draw-Text $graphics "Control lanes" $sectionFont $text 88 684 420 46
        $cardY = 744
        $cardW = 300
        for ($i = 0; $i -lt $Cards.Count; $i++) {
            $cx = 88 + ($i * ($cardW + 24))
            Draw-Panel $graphics $cx $cardY $cardW 220 $panel2 $softBorder
            Draw-Text $graphics $Cards[$i].Label $monoSmall $green ($cx + 24) ($cardY + 22) ($cardW - 48) 24
            Draw-Text $graphics $Cards[$i].Title $cardTitle $text ($cx + 24) ($cardY + 58) ($cardW - 48) 56
            Draw-Text $graphics $Cards[$i].Body $smallFont $muted ($cx + 24) ($cardY + 124) ($cardW - 48) 72
        }

        Draw-Text $graphics "Routing sample" $sectionFont $text 1080 448 420 46
        Draw-Panel $graphics 1080 512 580 438 $panel2 $softBorder
        Draw-Text $graphics "LANE" $monoSmall $faint 1110 538 140 26
        Draw-Text $graphics "OWNER" $monoSmall $faint 1286 538 140 26
        Draw-Text $graphics "STATE" $monoSmall $faint 1468 538 140 26
        $rowY = 590
        foreach ($row in $TableRows) {
            $stateBrush = $green
            if ($row.State -eq "RED") { $stateBrush = $red }
            if ($row.State -eq "YELLOW") { $stateBrush = $amber }
            $graphics.DrawLine($softBorder, 1110, ($rowY - 18), 1630, ($rowY - 18))
            Draw-Text $graphics $row.Lane $smallFont $text 1110 $rowY 168 28
            Draw-Text $graphics $row.Owner $smallFont $muted 1286 $rowY 160 28
            Draw-Text $graphics $row.State $monoSmall $stateBrush 1468 $rowY 120 28
            $rowY += 66
        }

        Draw-Text $graphics "Synthetic data only. No live GCP credentials, billing exports, or production finance records." $monoSmall $faint 88 990 1180 28
        Draw-Text $graphics "gcp.kineticgain.com" $monoSmall $cyan 1430 990 230 28 "Far"
    }
    finally {
        foreach ($resource in @($bg, $panel, $panel2, $chipBg, $text, $muted, $faint, $green, $cyan, $amber, $red, $plum, $border, $softBorder, $gridPen, $mono, $monoSmall, $eyebrow, $titleFont, $sectionFont, $cardTitle, $bodyFont, $smallFont, $metricValue, $metricLabel)) {
            if ($null -ne $resource) { $resource.Dispose() }
        }
    }

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-ProofBoard -Path (Join-Path $screenshots "01-overview-proof.png") `
    -Kicker "GCP BILLING ANOMALY ROUTER" `
    -Title "GCP billing anomalies routed before budget trust breaks." `
    -Subtitle "A FinOps control surface for budget breaches, service spikes, allocation drift, export gaps, and remediation sequencing." `
    -Metrics @(
        @{ Value = "6"; Label = "BASELINES"; Detail = "Fresh cost baselines." },
        @{ Value = "5"; Label = "ANOMALIES"; Detail = "Open routing packets." },
        @{ Value = "2"; Label = "BREACHES"; Detail = "Budget pressure visible." },
        @{ Value = "3"; Label = "ESCALATIONS"; Detail = "Owner action needed." }
    ) `
    -Cards @(
        @{ Label = "BUDGET"; Title = "Runway pressure"; Body = "Monthly budget breaches move into a routed containment lane." },
        @{ Label = "ALLOCATION"; Title = "Spend ownership"; Body = "Unlabeled spend is visible before showback trust erodes." },
        @{ Label = "EXPORT"; Title = "Data continuity"; Body = "Missing exports are treated as control-plane blockers." }
    ) `
    -TableRows @(
        @{ Lane = "Budget"; Owner = "FinOps"; State = "RED" },
        @{ Lane = "Labels"; Owner = "Platform"; State = "YELLOW" },
        @{ Lane = "Exports"; Owner = "Data"; State = "RED" },
        @{ Lane = "Commit"; Owner = "Finance"; State = "GREEN" }
    )

New-ProofBoard -Path (Join-Path $screenshots "02-billing-lane-proof.png") `
    -Kicker "BILLING LANE" `
    -Title "Billing lanes keep owners and next actions visible." `
    -Subtitle "Operators can scan budget, service spike, egress, commitment, allocation, and export posture without opening raw billing exports." `
    -Metrics @(
        @{ Value = "6"; Label = "LANES"; Detail = "Cost posture lanes." },
        @{ Value = "4"; Label = "OWNERS"; Detail = "Finance to platform." },
        @{ Value = "24h"; Label = "WINDOW"; Detail = "Review checkpoint." },
        @{ Value = "3"; Label = "BLOCKERS"; Detail = "Open posture blockers." }
    ) `
    -Cards @(
        @{ Label = "SERVICE"; Title = "Spike triage"; Body = "Service-level cost movement is separated from account-level noise." },
        @{ Label = "COMMITMENT"; Title = "Waste pressure"; Body = "Idle commitment drift is handled as a finance-owned exception." },
        @{ Label = "EXPORT"; Title = "Trust repair"; Body = "Missing export freshness is called out before reports drift." }
    ) `
    -TableRows @(
        @{ Lane = "Service"; Owner = "Platform"; State = "YELLOW" },
        @{ Lane = "Egress"; Owner = "Network"; State = "YELLOW" },
        @{ Lane = "Labels"; Owner = "Platform"; State = "RED" },
        @{ Lane = "Budget"; Owner = "FinOps"; State = "RED" }
    )

New-ProofBoard -Path (Join-Path $screenshots "03-anomaly-risks-proof.png") `
    -Kicker "ANOMALY RISKS" `
    -Title "Risk findings map severity, scope, and owner." `
    -Subtitle "The surface keeps high-severity breaches and export gaps at the top, with the exact family and remediation owner preserved." `
    -Metrics @(
        @{ Value = "2"; Label = "HIGH"; Detail = "Budget/export findings." },
        @{ Value = "3"; Label = "MEDIUM"; Detail = "Owner-visible drift." },
        @{ Value = "5"; Label = "FAMILIES"; Detail = "Cost anomaly families." },
        @{ Value = "0"; Label = "SECRETS"; Detail = "No cloud credentials." }
    ) `
    -Cards @(
        @{ Label = "BUDGET"; Title = "Breach"; Body = "A billing-account breach gets routed to FinOps before forecast close." },
        @{ Label = "LABELS"; Title = "Allocation drift"; Body = "Unlabeled spend becomes an owner repair packet, not a spreadsheet note." },
        @{ Label = "EXPORT"; Title = "Pipeline gap"; Body = "Missing billing exports become visible operational blockers." }
    ) `
    -TableRows @(
        @{ Lane = "Budget"; Owner = "FinOps"; State = "RED" },
        @{ Lane = "Export"; Owner = "Data"; State = "RED" },
        @{ Lane = "Egress"; Owner = "Network"; State = "YELLOW" },
        @{ Lane = "Labels"; Owner = "Platform"; State = "YELLOW" }
    )

New-ProofBoard -Path (Join-Path $screenshots "04-routing-posture-proof.png") `
    -Kicker "ROUTING POSTURE" `
    -Title "Remediation packets tie blockers to owners." `
    -Subtitle "Budget containment, label backfill, export restoration, and routing hygiene stay readable for platform and finance review." `
    -Metrics @(
        @{ Value = "82%"; Label = "READY"; Detail = "Top completeness score." },
        @{ Value = "3"; Label = "PACKETS"; Detail = "Need owner action." },
        @{ Value = "24h"; Label = "REVIEW"; Detail = "Next checkpoint." },
        @{ Value = "1"; Label = "CLEAR"; Detail = "Safe to monitor." }
    ) `
    -Cards @(
        @{ Label = "CONTAIN"; Title = "Budget control"; Body = "Containment packets are explicit before executive escalation." },
        @{ Label = "REPAIR"; Title = "Label backfill"; Body = "Ownership repair is linked to exact allocation drift." },
        @{ Label = "RESTORE"; Title = "Export health"; Body = "Export restoration is tracked as a data-continuity issue." }
    ) `
    -TableRows @(
        @{ Lane = "Contain"; Owner = "FinOps"; State = "RED" },
        @{ Lane = "Backfill"; Owner = "Platform"; State = "YELLOW" },
        @{ Lane = "Restore"; Owner = "Data"; State = "RED" },
        @{ Lane = "Monitor"; Owner = "Finance"; State = "GREEN" }
    )
