#!/usr/bin/env bash

# Recreate the build directory
rm -rf ./build
mkdir ./build

# concatenate files marked with <!-- #include --> into mapsextensions.js
# enclose the contents of the file inside anonymous function
# to avoid polluting global namespace.
echo "(function(){" >> ./build/mapsextensions.js
for filename in $(grep "#include" html/test.html | sed -r 's/.*src="...(.*)".*/\1/'); do
    cat $filename >> ./build/mapsextensions.js
done
echo "})();" >> ./build/mapsextensions.js

# copy over spherical_formulas.js
cp javascripts/spherical_formulas.js ./build/spherical_formulas.js

# Copy over test.html and correct <script> tags in it.
#
# Remove lines having <!-- #include -->
# Replace <!-- #insert --> with link to mapsextensions.js
# Correct the path to spherical_formulas.js
grep -v "#include" html/test.html | \
    sed 's/.*#insert.*/<script type="text\/javascript" src="mapsextensions.js"><\/script>/' | \
    sed 's/..\/javascripts\/spherical_formulas.js/spherical_formulas.js/' > ./build/test.html

