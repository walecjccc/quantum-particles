$projectDir = $PSScriptRoot
$tempDir = Join-Path $env:TEMP "gh-pages-deploy"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
$env:GH_CONFIG_DIR = Join-Path $env:TEMP "gh-config"

# Clean temp dir
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy built files
Copy-Item "$projectDir\dist\*" $tempDir -Recurse -Force

# Init git repo in temp dir
Set-Location $tempDir
git init
git checkout -b gh-pages
git add -A
git config user.name "walecjccc"
git config user.email "walecjccc@users.noreply.github.com"
git commit -m "Deploy to GitHub Pages"

# Configure proxy and auth
git config --local http.proxy "http://127.0.0.1:7897"
git config --local https.proxy "http://127.0.0.1:7897"
$token = & $gh auth token
git remote add origin "https://walecjccc:$token@github.com/walecjccc/quantum-particles.git"

# Push to gh-pages branch
git push origin gh-pages --force 2>&1

# Clean up remote URL
git remote set-url origin "https://github.com/walecjccc/quantum-particles.git"

Write-Output "=== Push complete ==="

# Enable GitHub Pages
& $gh api "repos/walecjccc/quantum-particles/pages" -X POST -f "source[branch]=gh-pages" -f "source[path]=/" 2>&1

Write-Output "=== Pages enabled ==="
