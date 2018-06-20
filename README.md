# G2GML

G2GML: Semantic Graph to Property Graph Mapping Language

# Getting Started

Go into the project directory.
```
$ cd g2gml
```

Install modules by npm.
```
$ npm install
```

You can check the installation by running the test script (Optional).

```
$ ./full_test.sh
```

Execute an example g2g for musicians on "ja.dbpedia.org".

```
$ node g2g.js pg examples/musician.g2g http://ja.dbpedia.org/sparql output/musician/
```
