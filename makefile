CLOSURE_COMPILER_JAR = /opt/closure-compiler/compiler.jar
SOURCE_DIRECTORY = source
MINIFIED_DIRECTORY = minified

default: all

regular:
	@echo Compiling Bark...
	@java -jar ${CLOSURE_COMPILER_JAR} --js ${SOURCE_DIRECTORY}/event-emitting.js --js_output_file ${MINIFIED_DIRECTORY}/bark.js --compilation_level ADVANCED_OPTIMIZATIONS --language_in=ECMASCRIPT5_STRICT --define debug=false --define jurassic=false --warning_level VERBOSE --summary_detail_level 3

jurassic:
	@echo "Compiling Jurassic Bark (a version that supports Internet Explorer 8)..."
	@java -jar ${CLOSURE_COMPILER_JAR} --js ${SOURCE_DIRECTORY}/event-emitting.js --js_output_file ${MINIFIED_DIRECTORY}/jurassic-bark.js --compilation_level ADVANCED_OPTIMIZATIONS --language_in=ECMASCRIPT5_STRICT --define debug=false --define jurassic=true --warning_level VERBOSE --summary_detail_level 3

all: regular jurassic
