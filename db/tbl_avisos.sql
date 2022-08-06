/*
Navicat SQLite Data Transfer

Source Server         : sqlite_avisos
Source Server Version : 30706
Source Host           : :0

Target Server Type    : SQLite
Target Server Version : 30706
File Encoding         : 65001

Date: 2022-08-06 17:15:06
*/

PRAGMA foreign_keys = OFF;

-- ----------------------------
-- Table structure for "main"."tbl_avisos"
-- ----------------------------
DROP TABLE "main"."tbl_avisos";
CREATE TABLE "tbl_avisos" (
"NUM_AVISO"  INTEGER NOT NULL,
"EST_AVISO"  TEXT(25),
"TIPO_OFICIO"  TEXT(25),
"TIPO_RED"  TEXT(25),
"TIPO_AVISO"  TEXT(50),
"SUMINISTRO"  INTEGER,
"NUM_INCIDENCIA"  INTEGER,
"NUM_OT"  INTEGER,
"ALCANCE"  TEXT(25),
"SECTOR"  INTEGER,
"F_ALTA"  INTEGER,
"F_ATENCION"  INTEGER,
"OBSER_TELGES"  TEXT,
"OBSER_CCSS"  TEXT,
"NCOD_CENTRO"  INTEGER,
"CENTRO_SERVICIO"  TEXT,
"NOMBRE_CLIENTE"  TEXT,
"REFERENCIA"  TEXT,
"NUM_MEDIDOR"  TEXT,
"MUNICIPALIDAD"  TEXT,
"AGUA"  INTEGER,
"DESAGUE"  INTEGER,
"gpslat"  REAL,
"gpslng"  REAL,
PRIMARY KEY ("NUM_AVISO" ASC),
CONSTRAINT "num_aviso" UNIQUE ("NUM_AVISO" ASC) ON CONFLICT REPLACE
);

-- ----------------------------
-- Records of tbl_avisos
-- ----------------------------

-- ----------------------------
-- Indexes structure for table tbl_avisos
-- ----------------------------
CREATE INDEX "main"."nis"
ON "tbl_avisos" ("SUMINISTRO" ASC);
CREATE INDEX "main"."ots"
ON "tbl_avisos" ("NUM_OT" ASC);
