var gulp = require('gulp'); 
 var _ = require('lodash');
var  FO=require('./FO.json');


var minimist = require('minimist');
var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};

var withDebug=minimist(process.argv.slice(2), knownOptions).env === 'debug' ;
 
var plugins = require('gulp-load-plugins')();
var ftpOption=FO;
function ftpDO(path){
	var obj=_.clone(ftpOption);
	if(path){
	obj.remotePath+=path;
	obj.remotePath.replace('//','/');	
	}
	return obj;
}
var paths = {
	build:{
		scripts : ['build/*'] 
	},
	debug:{ 
		scripts: ['js/**/*.js'],
		html:['html/**/*.html'],
		style:['css/*.css']
	}	
};	

  

gulp.task('watch:code', function () {
  gulp.watch([paths.debug.scripts], gulp.series('minify', 'minifyDebug','revs'));
});
gulp.task('watch:html', function () {
  gulp.watch([paths.debug.html], gulp.series('minifyTpl'));
});

gulp.task('watch:style', function () {
  gulp.watch([paths.debug.style], gulp.series('minifyCss','revs'));
});

 	 function minifyTpl(cb) {
  return   gulp.src(paths.debug.html) 
	  .pipe(plugins.utf8Convert())
      .pipe(plugins.minifyHtml({empty: true, quotes: true}))
      .pipe(plugins.angularTemplatecache('tpl.js',{
		  standalone:true,
		  transformUrl: function(url) {
	return url.replace(/[^\\\/]*[\\\/]+/g,'')
},
module :'starter.tpl'
		  
	  }))  
	  
      .pipe(gulp.dest('js'))
	  .on('finish', cb);
}
 function minify(cb) {
  return   gulp.src(paths.debug.scripts)
   //	.pipe(plugins.jshint())
  //  .pipe(plugins.jshint.reporter('default')) 
	
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.ngmin({dynamic: false}))  
	
	//.pipe(plugins.stripDebug()) 
	
	  .pipe(plugins.uglify())
	  .pipe(plugins.concat('all.min.js'))
	  .pipe(plugins.rev())  
      .pipe(gulp.dest('build/js'))
	  .pipe(plugins.ftp(ftpDO('js')))
	  
			.pipe(plugins.rev.manifest('build/rev/rev.json',{ 
		base: 'build',
            merge:  true
		}))                                
        .pipe(gulp.dest('build')) 
	  .on('finish', cb);
}
 function minifyDebug(cb) {
	 if(!withDebug) return cb();
  return   gulp.src(paths.debug.scripts)
   //	.pipe(plugins.jshint())
   // .pipe(plugins.jshint.reporter('default')) 
	
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.ngmin({dynamic: false}))  
	 
	  .pipe(plugins.concat('all.min.js'))
	  .pipe(plugins.rev())  
      .pipe(gulp.dest('build/debug/js'))
	  .pipe(plugins.ftp(ftpDO('debug/js')))
	  
	  	 
		.pipe(plugins.rev.manifest('build/rev/rev.json',{ 
		base: 'build',
            merge:  true
		}))                                
       .pipe(gulp.dest('build/debug'))
	  .on('finish', cb);
}


function rev(cb) {
    gulp.src(['build/rev/*.json','aspx/index.aspx'])  
 
        .pipe(plugins.revCollector())      
 .pipe(plugins.utf8Convert()) 
 .pipe(plugins.bom())   
 
        .pipe(gulp.dest('build'))
		 .pipe(plugins.ftp(ftpDO()))
 .on('finish', cb);		
}	
function revDebug(cb) { 
if(!withDebug) return cb();
   return  gulp.src(['build/debug/rev/*.json', 'aspx/index.aspx'])  
	
        .pipe(plugins.revCollector())  
		.pipe(plugins.utf8Convert())
		 .pipe(plugins.bom())  
        //{
		//	 replaceReved: true,
		//	 dirReplacements: {
		//		  'js/':'debug/js/'
		//	 }
		//}		
        .pipe(gulp.dest('build/debug'))
		.pipe(plugins.ftp(ftpDO('debug')))
.on('finish', cb);				
}	
 

function minifyCss(cb){
		return  gulp.src(paths.debug.style)
		.pipe(plugins.minifyCss())
		.pipe(plugins.concat('style.css'))
		 .pipe(plugins.rev())
		 
		 .pipe(gulp.dest('build/css'))
		 .pipe(plugins.ftp(ftpDO('css')))
		
		 .pipe( !withDebug ? plugins.util.noop() : gulp.dest('build/debug/css') )
		 .pipe(  !withDebug ? plugins.util.noop() : plugins.ftp(ftpDO('debug/css'))  )
		.pipe(plugins.rev.manifest('build/rev/rev.json',{ 
		base: 'build',
            merge:  true
		}))
		
       .pipe(gulp.dest('build')) 
	   
	   .pipe(  !withDebug ? plugins.util.noop() : gulp.dest('build/debug')) 
	   
         .on('finish', cb);
}
function others(cb) {
	return  gulp.src('others/*.*')
		 .pipe(gulp.dest('build/others'))
		 .pipe(gulp.dest('build/debug/others'))
         .on('finish', cb);
}
function images(cb) {
	return  gulp.src('images/*.*')
		 .pipe(gulp.dest('build/images'))
		 .pipe(gulp.dest('build/debug/images'))
         .on('finish', cb);
}


gulp.task('watch',gulp.parallel('watch:code','watch:html','watch:style'));

gulp.task(minifyTpl);


gulp.task(minify);
gulp.task(minifyDebug);
 
gulp.task(rev);
gulp.task(revDebug);

gulp.task(images);
gulp.task(others);
gulp.task(minifyCss); 
gulp.task('revs', gulp.series('rev', 'revDebug'));
gulp.task('scripts', gulp.series('minify', 'minifyDebug'));
//images , jsonFile , otherPages
gulp.task('publishStatic',gulp.series('others','images'));
//tpl+js ,revAsp
gulp.task('publishSS',gulp.series('minifyTpl','scripts','revs'));
gulp.task('publishMain',gulp.series('minifyCss','minifyTpl','scripts','revs'));
//gulp.task('publishScripts',gulp.series('scripts','revs'));
gulp.task('publish',gulp.series('publishStatic','publishMain'));


gulp.task('default', gulp.parallel('watch')  );
