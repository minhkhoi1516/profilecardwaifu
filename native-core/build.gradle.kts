import org.jetbrains.kotlin.gradle.ExperimentalWasmDsl

plugins {
    kotlin("multiplatform") version "2.4.21"
}

group = "dev.minkoi.nativecore"
version = "5.6.1"

kotlin {
    @OptIn(ExperimentalWasmDsl::class)
    wasmJs {
        outputModuleName = "minkoi-native-core-wasm"
        browser()
        binaries.library()
        generateTypeScriptDefinitions()
    }

    js {
        outputModuleName = "minkoi-native-core-js"
        browser()
        useEsModules()
        binaries.library()
        generateTypeScriptDefinitions()
    }

    sourceSets {
        commonMain.dependencies {
            // Direct Maven Central integration of official Miuix & COUI KMP artifacts (Apache-2.0).
            // Only non-Composable physics/easing/feedback APIs are referenced so Kotlin/Wasm & JS DCE
            // strips Compose UI & Skiko completely (verified by sync-to-web.mjs: skikoImports == 0).
            implementation("top.yukonga.miuix.kmp:miuix-ui:0.9.5-rc01")
            implementation("io.github.suqi8.coui.kmp:coui-ui:2.1.0")
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}
