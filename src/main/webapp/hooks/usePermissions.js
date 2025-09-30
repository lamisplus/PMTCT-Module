import { useState, useEffect, useMemo } from "react";
import { getPermissions, getRoles } from "../utils/localstorage";

export const usePermissions = () => {
  const [permissionSet, setPermissionSet] = useState(new Set());
  const [hasRDE, setHasRDE] = useState(false);
  const [strictlyRDE, setStrictlyRDE] = useState(false);

  const [loading, setLoading] = useState(true);

  //load Roles

      const loadRolesAndPerms = async () => {
      try {

        //ROLES
        const Arrayroles = await getRoles();
        let userRoles = new Set(Array.isArray(Arrayroles) ? Arrayroles : []);

        // let userRoles = new Set(["super admin", ""]);
        let userHasRde= userRoles.has("RDE")

        setStrictlyRDE(userHasRde)
        //PERMMISIONS
        const perms = await getPermissions();
        let permsSet=new Set(Array.isArray(perms) ? perms : [])
        let hasAllPerms =permsSet.has("all_permission")
        setPermissionSet(permsSet);

        //SEE ALL
        setHasRDE(userHasRde || hasAllPerms)

      } catch (error) {
        console.error("Error loading permissions:", error);
        setPermissionSet(new Set());
      } finally {
        setLoading(false);
      }
    };



  //load permission 
    // const loadPermissions = async () => {
    //   try {
       
    //   } catch (error) {
    //     console.error("Error loading permissions:", error);
    //     setPermissionSet(new Set());
    //   } finally {
    //     setLoading(false);
    //   }
    // };

  useEffect(() => {

    loadRolesAndPerms()
    // loadPermissions();
  }, []);

  const checkPermissions = useMemo(
    () => ({
      hasPermission: (permission) => permissionSet.has(permission),
       hasRDErole: hasRDE,
      hasStrictylyRDE: strictlyRDE,
      hasAnyPermission: (...permissions) =>
        permissions.some((p) => permissionSet.has(p)),
    }),
    [permissionSet, hasRDE]
  );

  
  return { ...checkPermissions, loading };
};
