
const log4jsConfig = {

  "appenders": {
    "console": {
      "type": "console"
    },
    "info": {
      "type": "dateFile",
      "filename": "src/logs/all-logs",
      "pattern": "yyyy-MM-dd-hh.log",
      "alwaysIncludePattern": true
    },
    "warn": {
      "type": "dateFile",
      "filename": "src/logs/warn",
      "pattern": "yyyy-MM-dd-hh.log",
      "alwaysIncludePattern": true
    },
    "error": {
      "type": "dateFile",
      "filename": "src/logs/error",
      "pattern": "yyyy-MM-dd-hh.log",
      "alwaysIncludePattern": true
    }
  },
  "categories": {
    "default": {
      "appenders": [
        "console"
      ],
      "level": "debug"
    },
    "info": {
      "appenders": [
        "info",
        "console"
      ],
      "level": "info"
    },
    "warn": {
      "appenders": [
        "warn",
        "console"
      ],
      "level": "warn"
    },
    "error": {
      "appenders": [
        "error",
        "console"
      ],
      "level": "error"
    }
  }

}

export {log4jsConfig};
