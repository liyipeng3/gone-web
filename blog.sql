SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `coid` int unsigned NOT NULL AUTO_INCREMENT,
  `cid` int unsigned DEFAULT '0',
  `created` int unsigned DEFAULT '0',
  `author` varchar(200) DEFAULT NULL,
  `authorId` int unsigned DEFAULT '0',
  `ownerId` int unsigned DEFAULT '0',
  `mail` varchar(200) DEFAULT NULL,
  `url` varchar(200) DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `agent` varchar(200) DEFAULT NULL,
  `text` text,
  `type` varchar(16) DEFAULT 'comment',
  `status` varchar(16) DEFAULT 'approved',
  `parent` int unsigned DEFAULT '0',
  `authorImg` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`coid`),
  KEY `cid` (`cid`),
  KEY `created` (`created`)
) ENGINE=MyISAM AUTO_INCREMENT=2174 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for fields
-- ----------------------------
DROP TABLE IF EXISTS `fields`;
CREATE TABLE `fields` (
  `cid` int unsigned NOT NULL,
  `name` varchar(200) NOT NULL,
  `type` varchar(8) DEFAULT 'str',
  `str_value` text,
  `int_value` int DEFAULT '0',
  `float_value` float DEFAULT '0',
  PRIMARY KEY (`cid`,`name`),
  KEY `int_value` (`int_value`),
  KEY `float_value` (`float_value`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for gallery
-- ----------------------------
DROP TABLE IF EXISTS `gallery`;
CREATE TABLE `gallery` (
  `gid` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'gallery表主键',
  `thumb` varchar(200) DEFAULT NULL COMMENT '缩略图',
  `image` varchar(200) DEFAULT NULL COMMENT '原图',
  `sort` int DEFAULT '0' COMMENT '相册组',
  `name` varchar(200) DEFAULT NULL COMMENT '图片名称',
  `description` varchar(200) DEFAULT NULL COMMENT '图片描述',
  `order` int unsigned DEFAULT '0' COMMENT '图片排序',
  PRIMARY KEY (`gid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for links
-- ----------------------------
DROP TABLE IF EXISTS `links`;
CREATE TABLE `links` (
  `lid` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'links表主键',
  `name` varchar(200) DEFAULT NULL COMMENT 'links名称',
  `url` varchar(200) DEFAULT NULL COMMENT 'links网址',
  `sort` varchar(200) DEFAULT NULL COMMENT 'links分类',
  `image` varchar(200) DEFAULT NULL COMMENT 'links图片',
  `description` varchar(200) DEFAULT NULL COMMENT 'links描述',
  `user` varchar(200) DEFAULT NULL COMMENT '自定义',
  `order` int unsigned DEFAULT '0' COMMENT 'links排序',
  PRIMARY KEY (`lid`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for metas
-- ----------------------------
DROP TABLE IF EXISTS `metas`;
CREATE TABLE `metas` (
  `mid` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `type` varchar(32) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `count` int unsigned DEFAULT '0',
  `order` int unsigned DEFAULT '0',
  `parent` int unsigned DEFAULT '0',
  PRIMARY KEY (`mid`),
  KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for options
-- ----------------------------
DROP TABLE IF EXISTS `options`;
CREATE TABLE `options` (
  `name` varchar(32) NOT NULL,
  `value` int NOT NULL,
  PRIMARY KEY (`name`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for posts
-- ----------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `cid` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` int DEFAULT '1',
  `title` varchar(200) DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `created` int unsigned DEFAULT '0',
  `modified` int unsigned DEFAULT '0',
  `text` longtext,
  `order` int unsigned DEFAULT '0',
  `type` varchar(16) DEFAULT 'post',
  `status` varchar(16) DEFAULT 'publish',
  `password` varchar(32) DEFAULT NULL,
  `commentsNum` int unsigned DEFAULT '0',
  `allowComment` char(1) DEFAULT '0',
  `parent` int unsigned DEFAULT '0',
  `viewsNum` int DEFAULT '0',
  `likesNum` int DEFAULT '0',
  PRIMARY KEY (`cid`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `unique-slug` (`slug`) USING BTREE,
  KEY `created` (`created`)
) ENGINE=InnoDB AUTO_INCREMENT=339 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for relationships
-- ----------------------------
DROP TABLE IF EXISTS `relationships`;
CREATE TABLE `relationships` (
  `cid` int unsigned NOT NULL,
  `mid` int unsigned NOT NULL,
  PRIMARY KEY (`cid`,`mid`),
  KEY `cid` (`cid`),
  KEY `mid` (`mid`),
  CONSTRAINT `cid` FOREIGN KEY (`cid`) REFERENCES `posts` (`cid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mid` FOREIGN KEY (`mid`) REFERENCES `metas` (`mid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `uid` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL,
  `mail` varchar(200) DEFAULT NULL,
  `url` varchar(200) DEFAULT NULL,
  `screenName` varchar(32) DEFAULT NULL,
  `created` int unsigned DEFAULT '0',
  `activated` int unsigned DEFAULT '0',
  `logged` int unsigned DEFAULT '0',
  `group` varchar(16) DEFAULT 'visitor',
  `authCode` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `name` (`username`),
  UNIQUE KEY `mail` (`mail`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

SET FOREIGN_KEY_CHECKS = 1;
