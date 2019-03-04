<template>
  <main>
    <div class="fileContainer">
      <input type="file" class="fileInput" ref="fileInput" @change="handleImageSelect">
      <label tabindex="0" for="file" class="inputTrigger">{{fileName}}</label>
    </div>

    <div class="info">
      <p>
        Archivo seleccionado:
        <span v-if="filePath">{{filePath}}</span>
      </p>
      <p>
        Niveles de zoom:
        <span v-if="levels">{{levels}}</span>
      </p>
      <p>
        # de imágenes (tiles):
        <span v-if="totalTiles">{{totalTiles}}</span>
      </p>
    </div>

    <div class="fileContainer" v-if="filePath">
      <input type="file" class="fileInput" ref="outDir" @change="handleOutDir" webkitdirectory>
      
      <label tabindex="0" for="file" class="inputTrigger outDir">{{folderName}}</label>
    </div>

    <button @click="slice" :disabled="!ready">Procesar</button>

    <div class="progressPieChart" ref="progress" v-if="processing">
      <div class="ppc-progress">
        <div class="ppc-progress-fill" ref="progressFill"></div>
      </div>
      <div class="ppc-percents">
        <div class="pcc-percents-wrapper">
          <span>{{percent}}%</span>
        </div>
      </div>
    </div>

    <div v-bind:class="{ log: true, error: isError }">{{log}}</div>
  </main>
</template>

<script>
import path from "path";
import Slicer from "../utils/Slicer";
import slugify from "slugify";

export default {
  name: "landing-page",
  data() {
    return {
      filePath: null,
      fileName: "Seleccionar imagen...",
      percent: 0,
      processing: false,
      levels: null,
      totalTiles: null,
      log: "",
      folderName: "Carpeta destino:",
      ready: false,
      isError: false
    };
  },

  mounted() {
    this.resetData();
  },

  methods: {
    handleImageSelect(e) {
      this.resetData();
      const file = e.target.files[0];
      const fileInfo = path.parse(file.path);

      this.slicer = new Slicer({
        file: file.path
      });

      this.slicer.on("loading", file => {
        this.fileName = "...";
        this.log = `Cargando: ${file}`;
      });

      this.slicer.on("levels", d => {
        this.loadingImg = false;
        this.levels = d.length - 1;
        this.fileName = path.basename(file.name, path.extname(file.name));
        this.filePath = file.path;
        this.setOutFolder(fileInfo.dir);
        this.log = `Imágen cargada exitosamente: ${file.name}`;
      });

      this.slicer.on("tasks", (totalImages, tasks) => {
        this.totalTiles = totalImages;
      });

      this.slicer.on("start", (files, options) => {
        this.log = `Procesando ${files} imágenes`;
      });

      this.slicer.on("error", file => {
        this.resetData();
        this.log = `El archivo ${file} no se puede procesar.`;
        this.isError = true;
      });

      this.slicer.on("progress", (progress, total, current, file) => {
        this.log = `Procesando imagen: ${file}`;
        this.updateProgress(progress);
      });

      this.slicer.on("end", () => {
        this.log = "¡Proceso exitoso!";
      });
    },

    handleOutDir(e) {
      this.setOutFolder(e.target.files[0].path);
    },

    setOutFolder(out) {
      const slug = slugify(this.fileName, { lower: true });
      this.folderName = `Destino: ${out}/${slug}/`;
      this.slicer.setOutputFolder(`${out}/${slug}`);
      this.ready = true;
    },

    resetData() {
      this.percent = 0;
      this.processing = false;
      this.levels = null;
      this.totalTiles = null;
      this.filePath = null;
      this.fileName = "Seleccionar imagen...";
      this.ready = false;
      this.log = "";
      this.isError = false;
    },

    updateProgress(progress) {
      const percent = Math.round(progress * 100);
      const deg = (360 * percent) / 100;
      let ele = this.$refs.progress;

      if (percent > 50) {
        ele.classList.add("gt-50");
      } else {
        ele.classList.remove("gt-50");
      }

      this.$refs.progressFill.style.transform = `rotate(${deg}deg`;
      this.percent = percent;
    },

    slice() {
      this.processing = true;
      this.ready = false;
      this.slicer.start();
    }
  }
};
</script>

<style lang="scss">
$size: 200px;
$fill: #181818;
$green: #41c5ab;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial;
  background: #f7f7f7;
  width: 80%;
  margin: 0 auto;
}

.info {
  font-size: 0.85em;

  p {
    padding: 0.2em 0;
  }

  span {
    font-weight: bold;
  }
}

.fileContainer {
  position: relative;
  margin: 1em auto;
  text-align: center;

  .fileInput {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    padding: 14px 0;
    cursor: pointer;
  }

  .inputTrigger {
    display: block;
    padding: 14px 45px;
    background: $green;
    color: $fill;
    font-size: 1em;

    &.outDir {
      padding: 10px 0;
      font-size: 0.75em;
    }
  }
}

@mixin circle($size) {
  content: "";
  position: absolute;
  border-radius: 50%;
  left: calc(50% - #{$size/2});
  top: calc(50% - #{$size/2});
  width: $size;
  height: $size;
}

.progressPieChart {
  width: $size;
  height: $size;
  border-radius: 50%;
  background-color: #e5e5e5;
  position: relative;
  margin: 1em auto;

  &.gt-50 {
    background-color: $fill;
  }
}
.ppc-progress {
  @include circle($size);

  clip: rect(0, $size, $size, #{$size/2});

  .ppc-progress-fill {
    @include circle($size);
    clip: rect(0, #{$size/2}, $size, 0);
    background: $fill;
    transform: rotate(60deg);
  }
  .gt-50 & {
    clip: rect(0, #{$size/2}, $size, 0);
    .ppc-progress-fill {
      clip: rect(0, $size, $size, #{$size/2});
      background: #e5e5e5;
    }
  }
}

.ppc-percents {
  @include circle(#{$size/1.15});
  background: #fff;
  text-align: center;
  display: table;

  span {
    display: block;
    font-size: 2.6em;
    font-weight: bold;
    color: #0f0f0f;
  }
}

.pcc-percents-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.progress-pie-chart {
  margin: 50px auto 0;
}

.log {
  width: 100%;
  font-size: 0.75em;
  font-style: italic;
  padding: 1em;
  background-color: $fill;
  color: white;
  position: fixed;
  bottom: 0;
  left: 0;

  &.error {
    background-color: rgb(231, 50, 50);
  }
}

.compass {
  .back {
    fill: rgba(255, 255, 255, 0.3);
  }
  .direction {
    fill: none;
  }
  .chevron {
    fill: none;
    stroke: rgb(0, 0, 0);
    stroke-width: 3px;
  }
  .zoom .chevron {
    stroke-width: 3px;
  }
  .active .chevron,
  .chevron.active {
    stroke: rgb(49, 49, 49);
  }
  &.active .active .direction {
    fill: rgb(236, 236, 236);
  }
}

button {
  padding: 1em;
  background-color: $green;
  border: none;
  cursor: pointer;
  transition: all 0.4s;

  &:hover,
  &:focus {
    background: $fill;
    color: $green;
  }

  &:disabled {
    background-color: rgb(192, 192, 192);
    font-style: italic;
    color: black;
  }
}
</style>
