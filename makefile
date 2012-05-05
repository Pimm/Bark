CLOSURE_COMPILER_JAR = /opt/closure-compiler/compiler.jar
SOURCE_DIRECTORY = source
MINIFIED_DIRECTORY = minified

default: all

regular:
	java -jar ${CLOSURE_COMPILER_JAR} --js ${SOURCE_DIRECTORY}/event-emitting.js --js_output_file ${MINIFIED_DIRECTORY}/bark.js --compilation_level ADVANCED_OPTIMIZATIONS --define jurassic=false --warning_level VERBOSE

jurassic:
	java -jar ${CLOSURE_COMPILER_JAR} --js ${SOURCE_DIRECTORY}/event-emitting.js --js_output_file ${MINIFIED_DIRECTORY}/jurassic-bark.js --compilation_level ADVANCED_OPTIMIZATIONS --define jurassic=true --warning_level VERBOSE

all: regular jurassic
