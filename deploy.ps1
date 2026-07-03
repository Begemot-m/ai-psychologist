# Deploy script for ai-psychologist.
# Pushes main, rebuilds the static prototype into the gh-pages branch and
# deploys the psy-chat edge function to Supabase.
# Usage: .\deploy.ps1 [-SkipPages] [-SkipFunctions]

param(
    [switch]$SkipPages,
    [switch]$SkipFunctions
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$ProjectRef = "abdlkghlchczwenobvkx"

# Node lives in scoop; npm cache must stay on an ASCII path because the
# user profile folder name is non-ASCII and breaks npm otherwise.
$env:Path = "$env:USERPROFILE\scoop\apps\nodejs-lts\current;$env:USERPROFILE\scoop\shims;$env:Path"
$fso = New-Object -ComObject Scripting.FileSystemObject
$shortProfile = $fso.GetFolder($env:USERPROFILE).ShortPath
$env:npm_config_cache = "$shortProfile\AppData\Local\npm-cache-ascii"

Write-Host "== Push main ==" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { throw "git push main failed (VPN needed?)" }

if (-not $SkipPages) {
    Write-Host "== Build static app ==" -ForegroundColor Cyan
    npm run build:pages
    if ($LASTEXITCODE -ne 0) { throw "vite build failed" }

    Write-Host "== Publish to gh-pages ==" -ForegroundColor Cyan
    $tree = Join-Path (Split-Path $PSScriptRoot -Parent) "ai-psy-pages"
    if (Test-Path $tree) { Remove-Item $tree -Recurse -Force }
    git worktree prune
    git worktree add $tree gh-pages
    if ($LASTEXITCODE -ne 0) { throw "worktree add failed" }

    Get-ChildItem $tree -Force |
        Where-Object Name -notin ".git", ".nojekyll" |
        Remove-Item -Recurse -Force
    Copy-Item "dist-gh-pages\*" $tree -Recurse -Force
    if (-not (Test-Path "$tree\.nojekyll")) {
        New-Item -ItemType File "$tree\.nojekyll" | Out-Null
    }

    Push-Location $tree
    git add -A
    $changes = git status --porcelain
    if ($changes) {
        git commit -m "Deploy static prototype"
        git push origin gh-pages
        if ($LASTEXITCODE -ne 0) { Pop-Location; throw "git push gh-pages failed" }
    } else {
        Write-Host "gh-pages: nothing changed"
    }
    Pop-Location

    git worktree remove $tree --force 2>$null
    if (Test-Path $tree) { Remove-Item $tree -Recurse -Force; git worktree prune }
}

if (-not $SkipFunctions) {
    Write-Host "== Deploy edge function ==" -ForegroundColor Cyan
    supabase functions deploy psy-chat --project-ref $ProjectRef --no-verify-jwt --use-api
}

Write-Host "== Done ==" -ForegroundColor Green
