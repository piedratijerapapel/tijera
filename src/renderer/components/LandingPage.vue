<template>
  <main>
    <div class="fileContainer">
      <input type="file" class="upload" ref="fileInput" @change="handleImageSelect">
      <label tabindex="0" for="file" class="inputFileTrigger">{{fileName}}</label>
    </div>

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

    <p class="info" v-if="filePath">
      Archivo seleccionado:
      <span>{{filePath}}</span>
    </p>
    <p class="info" v-if="levels">
      Niveles de zoom:
      <span>{{levels}}</span>
    </p>
    <p class="info" v-if="totalTiles">
      # de imágenes (tiles):
      <span>{{totalTiles}}</span>
    </p>

    <input type="file" class="outDir" ref="outDir" @change="handleOutDir" webkitdirectory>
  </main>
</template>

<script>
import path from "path";
import Slicer from "../utils/Slicer";

export default {
  name: "landing-page",
  data() {
    return {
      filePath: null,
      fileName: "Seleccionar imagen...",
      percent: 0,
      processing: false,
      levels: null,
      totalTiles: null
    };
  },

  mounted() {},

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
        console.log(`Loading ${file}`);
      });

      this.slicer.on("levels", d => {
        this.loadingImg = false;
        this.levels = d.length - 1;
        this.fileName = path.basename(file.name, path.extname(file.name));
        this.filePath = file.path;
        console.log(`Image loaded.`, d);
      });

      this.slicer.on("tasks", (totalImages, tasks) => {
        this.totalTiles = totalImages;
        console.log(totalImages);
      });

      this.slicer.on("options", options => {
        console.log(options);
      });

      this.slicer.on("start", (files, options) => {
        console.info(`Start processing ${files} files.`);
      });

      this.slicer.on("error", err => {
        console.error(err);
      });

      this.slicer.on("progress", (progress, total, current, file) => {
        this.updateProgress(progress);
      });

      this.slicer.on("end", () => {
        console.info("Finished processing slices");
      });
    },

    handleOutDir(e) {
      console.log(e);
      this.slicer.setOutputFolder(`maps/${fileInfo.name}/{z}/{y}/{x}`);
    },

    resetData() {
      this.percent = 0;
      this.processing = false;
      this.levels = null;
      this.totalTiles = null;
      this.filePath = null;
      this.fileName = "Seleccionar imagen...";
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
      //this.slicer.start();
    }
  }
};
</script>

<style lang="scss">
$size: 200px;
$fill: #181818;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial;
  background: #f7f7f7;
}

.info {
  font-size: 0.85em;
  padding: 0.2em 3em;

  span {
    font-weight: bold;
  }
}

.fileContainer {
  position: relative;
  width: 50%;
  margin: 1em auto;
  text-align: center;

  .upload {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    padding: 14px 0;
    cursor: pointer;

    &:hover + .inputFileTrigger,
    &:focus + .inputFileTrigger {
      background: #000000;
      color: #41c5ab;
    }
  }
  .inputFileTrigger {
    display: block;
    padding: 14px 45px;
    background: #41c5ab;
    color: $fill;
    font-size: 1em;
    transition: all 0.4s;
    cursor: pointer;
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
</style>
