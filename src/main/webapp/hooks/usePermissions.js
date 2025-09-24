import { useState, useEffect, useMemo } from "react";
import { getPermissions, getRoles } from "../utils/localstorage";

export const usePermissions = () => {
  const [permissionSet, setPermissionSet] = useState(new Set());
  const [hasRDE, setHasRDE] = useState(false);

  const [loading, setLoading] = useState(true);


  //load Roles

      const loadRoles = async () => {
      try {
        const Arrayroles = await getRoles();
        let userRoles = new Set(Array.isArray(Arrayroles) ? Arrayroles : []);

        // let userRoles = new Set(["super admin"]);

        let userHasRde= userRoles.has("RDE")
         setHasRDE(userHasRde)

      } catch (error) {
        console.error("Error loading permissions:", error);
        setPermissionSet(new Set());
      } finally {
        setLoading(false);
      }
    };



  //load permission 
    const loadPermissions = async () => {
      try {
        const perms = await getPermissions();
        setPermissionSet(new Set(Array.isArray(perms) ? perms : []));
      } catch (error) {
        console.error("Error loading permissions:", error);
        setPermissionSet(new Set());
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {

    loadRoles()
    loadPermissions();
  }, []);

  const checkPermissions = useMemo(
    () => ({
      hasPermission: (permission) => permissionSet.has(permission),
       hasRDErole: hasRDE,

      hasAnyPermission: (...permissions) =>
        permissions.some((p) => permissionSet.has(p)),
    }),
    [permissionSet]
  );

  
  return { ...checkPermissions, loading };
};
