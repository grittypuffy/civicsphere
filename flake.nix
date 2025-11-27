{
  description = "CivicSphere Development Environment";
  inputs = {
    pkgs-stb.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    pkgs-unstb.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, pkgs-stb, pkgs-unstb, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
     	let
    		stb = pkgs-stb.legacyPackages.${system};
    		unstb = pkgs-unstb.legacyPackages.${system};
    	in {
        devShells.default = stb.mkShell {
       	  packages = with stb; [
       	    bun
       	    yarn 
       	    mkcert
       	    docker-compose
       	    python3
       	    poetry
       	    stdenv.cc.cc.lib
         	];
          shellHook = ''
            export NIX_SHELL_NAME="CivicSphere";
            export LD_LIBRARY_PATH=${stb.stdenv.cc.cc.lib}/lib:$LD_LIBRARY_PATH
          '';
        };
      }
    );
}
