# ============================================================
#  run-seeds.ps1
#  Ejecuta los seeds en los contenedores PostgreSQL de RedNorte
#  Uso: .\seeds\run-seeds.ps1
#  (ejecutar desde D:\GeneralClaude\rednorte-platform)
# ============================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "[+] $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "[i] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[!] $msg" -ForegroundColor Red }

# -- Verifica que los contenedores esten corriendo
Write-Step "Verificando contenedores..."

$containers = @("db-disponibilidad", "db-espera", "db-pacientes")
foreach ($c in $containers) {
    $status = docker inspect -f '{{.State.Running}}' $c 2>$null
    if ($status -ne "true") {
        Write-Err "El contenedor '$c' no esta corriendo. Ejecuta 'docker compose up -d' primero."
        exit 1
    }
    Write-Info "  ${c} -> OK"
}

# -- Funcion helper
function Run-Seed {
    param($container, $db, $sqlFile, $label)
    Write-Step "Ejecutando seed: ${label}"
    $sql = Get-Content $sqlFile -Raw -Encoding UTF8
    $result = $sql | docker exec -i $container psql -U postgres -d $db 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Error en seed ${label}"
        Write-Host $result
        exit 1
    }
    $result | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" }
    Write-Host ""
}

# -- 1. db-disponibilidad: medicos + horas
Run-Seed "db-disponibilidad" "db_disponibilidad" "$PSScriptRoot\seed-disponibilidad.sql" "Medicos y horas disponibles"

# -- 2. db-espera: usuarios + solicitudes
Run-Seed "db-espera" "db_espera" "$PSScriptRoot\seed-espera.sql" "Usuarios y solicitudes"

# -- 3. db-pacientes: perfiles + historial
Run-Seed "db-pacientes" "db_pacientes" "$PSScriptRoot\seed-pacientes.sql" "Pacientes e historial"

Write-Host ""
Write-Step "Seeds ejecutados correctamente."
Write-Host ""
Write-Info "Credenciales de acceso (contrasena: Admin1234)"
Write-Host "  Admin       ->  RUT: 12345678-9   rol: admin"
Write-Host "  Paciente 1  ->  RUT: 12345678-K   rol: paciente"
Write-Host "  Paciente 2  ->  RUT: 23456789-0   rol: paciente"
Write-Host "  Dr. Munoz   ->  RUT: 44444444-4   rol: medico"
Write-Host "  Dra. Vidal  ->  RUT: 55555555-5   rol: medico"
